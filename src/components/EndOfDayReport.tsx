import type { FamilyMember } from '../family/types'
import type { EnergyReport } from '../family/energy'
import './EndOfDayReport.css'

export type DayReport = { member: FamilyMember; report: EnergyReport }

type Props = {
  day: number
  reports: DayReport[]
  everyoneFed: boolean
  onNextDay: () => void
  onBack: () => void
}

export function EndOfDayReport({ day, reports, everyoneFed, onNextDay, onBack }: Props) {
  return (
    <section className="day-summary" aria-label="End of day energy report">
      <h2 className="day-summary-title">🌙 End of Day {day}</h2>
      <ul className="energy-list">
        {reports.map(({ member, report }) => (
          <li key={member.id} className={`energy-row energy-row-${report.status}`}>
            <span className="energy-row-who">
              <span className="energy-row-emoji" aria-hidden="true">{member.emoji}</span>
              <span className="energy-row-name">{member.name}</span>
            </span>
            <span className="energy-row-stats">
              <span>🔥 in <strong>{report.consumed}</strong> cal</span>
              <span>💪 burned <strong>{report.burned}</strong> cal</span>
              <span>🎯 needed <strong>{report.target}</strong></span>
              <span className="energy-row-macros">
                <span className={macroClass(report.macros.protein, report.macroTargets.protein)}>P <strong>{report.macros.protein}</strong> / {report.macroTargets.protein}g</span>
                <span className={macroClass(report.macros.carbs, report.macroTargets.carbs)}>C <strong>{report.macros.carbs}</strong> / {report.macroTargets.carbs}g</span>
                <span className={macroClass(report.macros.fat, report.macroTargets.fat)}>F <strong>{report.macros.fat}</strong> / {report.macroTargets.fat}g</span>
              </span>
              <span className="energy-row-bmr">metabolism ~{member.profile.bmrPerHour} cal/hr + activity {member.profile.activityCalories}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="day-summary-lesson">
        {everyoneFed
          ? "Everyone made it through the day with enough fuel. That's a balanced day — well done!"
          : "Try combo plates (several items per person) and add snacks to fill the gaps. Real bodies need a steady stream of food across the day."}
      </p>
      <div className="kitchen-actions">
        <button type="button" className="primary-action" onClick={onNextDay}>☀ Start Day {day + 1}</button>
        <button type="button" className="secondary-action" onClick={onBack}>← Back to kitchen</button>
      </div>
    </section>
  )
}

function macroClass(actual: number, target: number): string {
  const ratio = target > 0 ? actual / target : 0
  if (ratio >= 0.9) return 'macro-pill macro-good'
  if (ratio >= 0.5) return 'macro-pill macro-okay'
  if (ratio >= 0.2) return 'macro-pill macro-low'
  return 'macro-pill macro-empty'
}
