import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import * as ts from "typescript";
import { describe, expect, it } from "vitest";
import { TOOL_RELIABILITY_HOLDS } from "../components/toolReliabilityHolds";

const APP_SOURCE_PATH = resolve(process.cwd(), "src", "App.tsx");
const APP_SOURCE = ts.createSourceFile(
  APP_SOURCE_PATH,
  readFileSync(APP_SOURCE_PATH, "utf8"),
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX,
);

const REQUIRED_CLIENT_FIREBASE_ENV_KEYS = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_APP_ID",
] as const;

function descendants(root: ts.Node): ts.Node[] {
  const nodes: ts.Node[] = [];
  const visit = (node: ts.Node) => {
    nodes.push(node);
    ts.forEachChild(node, visit);
  };

  visit(root);
  return nodes;
}

function unwrapExpression(expression: ts.Expression): ts.Expression {
  let current = expression;

  while (
    ts.isParenthesizedExpression(current) ||
    ts.isAsExpression(current) ||
    ts.isTypeAssertionExpression(current) ||
    ts.isNonNullExpression(current)
  ) {
    current = current.expression;
  }

  return current;
}

function findVariableDeclaration(name: string): ts.VariableDeclaration {
  const declaration = descendants(APP_SOURCE).find((node): node is ts.VariableDeclaration => (
    ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === name
  ));

  if (!declaration) {
    throw new Error(`App.tsx must declare ${name}.`);
  }

  return declaration;
}

function findRenderPageSwitch(): ts.SwitchStatement {
  const declaration = findVariableDeclaration("renderPage");
  if (!declaration.initializer) {
    throw new Error("App.tsx must initialize renderPage for the route availability policy.");
  }

  const renderPage = unwrapExpression(declaration.initializer);
  if (!ts.isArrowFunction(renderPage) && !ts.isFunctionExpression(renderPage)) {
    throw new Error("renderPage must remain a function that owns the route availability policy.");
  }

  const routeSwitch = descendants(renderPage).find((node): node is ts.SwitchStatement => {
    if (!ts.isSwitchStatement(node)) {
      return false;
    }

    const switchExpression = unwrapExpression(node.expression);
    return ts.isIdentifier(switchExpression) && switchExpression.text === "view";
  });

  if (!routeSwitch) {
    throw new Error("renderPage must retain a switch over the resolved view.");
  }

  return routeSwitch;
}

function findCaseClause(routeSwitch: ts.SwitchStatement, view: string): ts.CaseClause {
  const caseClause = routeSwitch.caseBlock.clauses.find((clause): clause is ts.CaseClause => {
    if (!ts.isCaseClause(clause)) {
      return false;
    }

    const caseExpression = unwrapExpression(clause.expression);
    return ts.isStringLiteral(caseExpression) && caseExpression.text === view;
  });

  if (!caseClause) {
    throw new Error(`renderPage must retain a case for the ${view} view.`);
  }

  return caseClause;
}

function identifierPath(expression: ts.Expression): string | undefined {
  const unwrapped = unwrapExpression(expression);
  if (ts.isIdentifier(unwrapped)) {
    return unwrapped.text;
  }

  if (!ts.isPropertyAccessExpression(unwrapped)) {
    return undefined;
  }

  const parentPath = identifierPath(unwrapped.expression);
  return parentPath ? `${parentPath}.${unwrapped.name.text}` : undefined;
}

function containsNamedJsxComponent(root: ts.Node, componentName: string): boolean {
  return descendants(root).some((node) => (
    (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) &&
    ts.isIdentifier(node.tagName) &&
    node.tagName.text === componentName
  ));
}

function containsHoldRendering(root: ts.Node, holdKey: string): boolean {
  const expectedSpread = `TOOL_RELIABILITY_HOLDS.${holdKey}`;

  return descendants(root).some((node) => {
    if (
      (!ts.isJsxSelfClosingElement(node) && !ts.isJsxOpeningElement(node)) ||
      !ts.isIdentifier(node.tagName) ||
      node.tagName.text !== "ToolReliabilityHoldPage"
    ) {
      return false;
    }

    return node.attributes.properties.some((attribute) => (
      ts.isJsxSpreadAttribute(attribute) &&
      identifierPath(attribute.expression) === expectedSpread
    ));
  });
}

function reliabilityHoldViews(): string[] {
  const declaration = findVariableDeclaration("RELIABILITY_HOLD_VIEWS");
  if (!declaration.initializer) {
    throw new Error("RELIABILITY_HOLD_VIEWS must have an initializer.");
  }

  const initializer = unwrapExpression(declaration.initializer);
  if (!ts.isNewExpression(initializer) || !ts.isIdentifier(initializer.expression) || initializer.expression.text !== "Set") {
    throw new Error("RELIABILITY_HOLD_VIEWS must be a Set literal.");
  }

  const [argument] = initializer.arguments ?? [];
  if (!argument) {
    throw new Error("RELIABILITY_HOLD_VIEWS must enumerate the held views.");
  }

  const values = unwrapExpression(argument);
  if (!ts.isArrayLiteralExpression(values)) {
    throw new Error("RELIABILITY_HOLD_VIEWS must be initialized from an array literal.");
  }

  return values.elements.map((element) => {
    if (ts.isSpreadElement(element)) {
      throw new Error("RELIABILITY_HOLD_VIEWS must list each held view explicitly.");
    }

    const value = unwrapExpression(element);
    if (!ts.isStringLiteral(value)) {
      throw new Error("RELIABILITY_HOLD_VIEWS entries must be string literals.");
    }

    return value.text;
  });
}

function logicalAndOperands(expression: ts.Expression): ts.Expression[] {
  const unwrapped = unwrapExpression(expression);
  if (
    ts.isBinaryExpression(unwrapped) &&
    unwrapped.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken
  ) {
    return [
      ...logicalAndOperands(unwrapped.left),
      ...logicalAndOperands(unwrapped.right),
    ];
  }

  return [unwrapped];
}

function clientFirebaseEnvironmentKey(expression: ts.Expression): string | undefined {
  const unwrapped = unwrapExpression(expression);
  if (!ts.isPropertyAccessExpression(unwrapped)) {
    return undefined;
  }

  const environment = unwrapExpression(unwrapped.expression);
  if (!ts.isPropertyAccessExpression(environment) || environment.name.text !== "env") {
    return undefined;
  }

  const importMeta = unwrapExpression(environment.expression);
  if (
    !ts.isMetaProperty(importMeta) ||
    importMeta.keywordToken !== ts.SyntaxKind.ImportKeyword ||
    importMeta.name.text !== "meta"
  ) {
    return undefined;
  }

  return unwrapped.name.text;
}

function clientWorkspaceConfigurationKeys(): string[] {
  const declaration = findVariableDeclaration("CLIENT_WORKSPACE_CONFIGURED");
  if (!declaration.initializer) {
    throw new Error("CLIENT_WORKSPACE_CONFIGURED must have an initializer.");
  }

  const initializer = unwrapExpression(declaration.initializer);
  if (
    !ts.isCallExpression(initializer) ||
    !ts.isIdentifier(initializer.expression) ||
    initializer.expression.text !== "Boolean" ||
    initializer.arguments.length !== 1
  ) {
    throw new Error("CLIENT_WORKSPACE_CONFIGURED must be an explicit Boolean all-of configuration gate.");
  }

  return logicalAndOperands(initializer.arguments[0]).map((operand) => {
    const key = clientFirebaseEnvironmentKey(operand);
    if (!key) {
      throw new Error("CLIENT_WORKSPACE_CONFIGURED must only combine import.meta.env Firebase values.");
    }

    return key;
  });
}

function isNegatedIdentifier(expression: ts.Expression, identifier: string): boolean {
  const unwrapped = unwrapExpression(expression);
  const operand = ts.isPrefixUnaryExpression(unwrapped)
    ? unwrapExpression(unwrapped.operand)
    : undefined;

  return (
    ts.isPrefixUnaryExpression(unwrapped) &&
    unwrapped.operator === ts.SyntaxKind.ExclamationToken &&
    operand !== undefined &&
    ts.isIdentifier(operand) &&
    operand.text === identifier
  );
}

describe("availability topology preservation contract", () => {
  it("parses the App availability policy as TSX", () => {
    const parseDiagnostics = (APP_SOURCE as ts.SourceFile & {
      parseDiagnostics: readonly ts.Diagnostic[];
    }).parseDiagnostics;

    expect(parseDiagnostics).toEqual([]);
  });

  it("keeps every non-workspace hold in App's hold-view policy and rendering map", () => {
    const nonWorkspaceHolds = Object.entries(TOOL_RELIABILITY_HOLDS)
      .filter(([key]) => key !== "workspace");
    const expectedViews = nonWorkspaceHolds.map(([, hold]) => hold.view);
    const policyViews = reliabilityHoldViews();
    const routeSwitch = findRenderPageSwitch();

    expect(new Set(expectedViews).size).toBe(expectedViews.length);
    expect(new Set(policyViews).size).toBe(policyViews.length);
    expect([...policyViews].sort()).toEqual([...expectedViews].sort());

    for (const [holdKey, hold] of nonWorkspaceHolds) {
      const caseClause = findCaseClause(routeSwitch, hold.view);
      expect(containsHoldRendering(caseClause, holdKey), `${hold.view} must render ${holdKey}'s hold definition`).toBe(true);
    }
  });

  it("keeps the portal fail-closed behind all required client Firebase configuration", () => {
    const clientConfigurationKeys = clientWorkspaceConfigurationKeys();
    const routeSwitch = findRenderPageSwitch();
    const portalCase = findCaseClause(routeSwitch, TOOL_RELIABILITY_HOLDS.workspace.view);
    const guardIndex = portalCase.statements.findIndex((statement) => (
      ts.isIfStatement(statement) && isNegatedIdentifier(statement.expression, "CLIENT_WORKSPACE_CONFIGURED")
    ));

    expect([...clientConfigurationKeys].sort()).toEqual([...REQUIRED_CLIENT_FIREBASE_ENV_KEYS].sort());
    expect(new Set(clientConfigurationKeys).size).toBe(clientConfigurationKeys.length);
    expect(guardIndex).toBeGreaterThanOrEqual(0);

    const missingConfigurationGuard = portalCase.statements[guardIndex] as ts.IfStatement;
    expect(missingConfigurationGuard.elseStatement).toBeUndefined();
    expect(
      descendants(missingConfigurationGuard.thenStatement).some((node) => (
        ts.isReturnStatement(node) && containsHoldRendering(node, "workspace")
      )),
    ).toBe(true);
    expect(
      portalCase.statements.slice(guardIndex + 1).some((statement) => (
        ts.isReturnStatement(statement) && containsNamedJsxComponent(statement, "ComplianceDashboard")
      )),
    ).toBe(true);
  });
});
