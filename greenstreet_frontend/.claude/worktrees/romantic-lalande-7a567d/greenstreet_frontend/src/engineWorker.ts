import { parentPort } from "worker_threads";
import {
  solveDSCR,
  matchLenders,
  scoreLenderMatch,
  checkPPPLegal,
  computeBreakevenResult,
  generateStructureOptions,
} from "./engine/index";
import { buildEngineInputs } from "./engine/inputs";

if (parentPort) {
  parentPort.on("message", (message) => {
    const { id } = message || {};
    try {
      const { type, payload } = message;
      let result;

      switch (type) {
        case "SOLVE": {
          const { property, borrower, loan, strategy } = buildEngineInputs(payload);
          const deal = solveDSCR(property, borrower, loan, strategy);
          const fitResults = matchLenders(property, borrower, loan, strategy, deal.solvedRate);
          const scoreResult = scoreLenderMatch(fitResults, loan, borrower, strategy);
          const topLenders = scoreResult.topPicks.map((p) => ({
            name: p.lenderName,
            score: p.totalScore,
            tier: p.tier,
            rank: p.rankAmongEligible,
            topReasons: p.topReasons.slice(0, 2),
          }));
          result = { deal, topLenders };
          break;
        }

        case "SENSITIVITY": {
          const { property, borrower, loan, strategy } = buildEngineInputs(payload);
          const deal = solveDSCR(property, borrower, loan, strategy);
          const termYears = loan.term === '30_YR' ? 30 : loan.term === '40_YR' ? 40 : 15;
          const sensitivity = computeBreakevenResult(
            deal.qualifyingRent,
            deal.monthlyPITIA.total,
            deal.loanAmount,
            deal.solvedRate,
            termYears,
            property.annualTaxes,
            property.annualInsurance,
            property.hoa,
            property.floodInsurance ?? 0,
            property.purchasePrice,
            loan.ltv,
          );
          result = { deal, sensitivity };
          break;
        }

        case "OPTIMIZE": {
          const { property, borrower, loan, strategy } = buildEngineInputs(payload);
          const options = generateStructureOptions(property, borrower, loan, strategy);
          result = { options };
          break;
        }

        case "STATE": {
          const ppp = checkPPPLegal(
            payload.state,
            payload.entityType as any,
            payload.loanAmount,
            payload.unitCount,
            payload.productType as any
          );
          result = { state: payload.state, ppp };
          break;
        }

        default:
          throw new Error(`Unknown worker task type: ${type}`);
      }

      parentPort?.postMessage({ id, success: true, result });
    } catch (error: any) {
      parentPort?.postMessage({ id, success: false, error: error.message });
    }
  });
}
