import React from "react";

const stages = ["applied", "screening", "interview", "offer", "hired"];

const nextStage = (stage) => stages[Math.min(stages.length - 1, stages.indexOf(stage) + 1)];

export default function HrRecruitmentBoard({ candidates, onMove }) {
  return (
    <section className="hr-board">
      {stages.map((stage) => (
        <article className="panel hr-board-column" key={stage}>
          <div className="panel__header">
            <div>
              <h3>{stage.replace("_", " ")}</h3>
              <p>{candidates.filter((candidate) => candidate.stage === stage).length} candidates</p>
            </div>
          </div>
          <div className="hr-board-cards">
            {candidates
              .filter((candidate) => candidate.stage === stage)
              .map((candidate) => (
                <article className="hr-board-card" key={candidate.id}>
                  <strong>{candidate.name}</strong>
                  <p>{candidate.role}</p>
                  <span>Owner: {candidate.owner}</span>
                  <span>Score: {candidate.score}</span>
                  {stage !== "hired" ? (
                    <button className="ghost-button" type="button" onClick={() => onMove(candidate.id, nextStage(stage))}>
                      Move to {nextStage(stage)}
                    </button>
                  ) : null}
                </article>
              ))}
          </div>
        </article>
      ))}
    </section>
  );
}

