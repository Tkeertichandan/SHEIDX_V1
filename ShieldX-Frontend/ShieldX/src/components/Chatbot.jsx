import { useState } from 'react'
import { api } from '../services/api'
import { useAppContext } from '../hooks/useAppContext'
import ErrorState from './common/ErrorState'

function Chatbot() {
  const { selectedUserId } = useAppContext()
  const [question, setQuestion] = useState('How does premium calculation work?')
  const [answer, setAnswer] = useState('')
  const [reportInput, setReportInput] = useState({ completedDeliveries: 45, onlineHours: 38, disruptionHours: 6 })
  const [report, setReport] = useState(null)
  const [loadingAction, setLoadingAction] = useState('')
  const [error, setError] = useState('')

  const askQuestion = async () => {
    setLoadingAction('ask')
    setError('')
    try {
      const response = await api.chat({ question })
      setAnswer(response.answer)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingAction('')
    }
  }

  const generateReport = async () => {
    setLoadingAction('report')
    setError('')
    if (!selectedUserId) {
      setError('Select a user before generating weekly report.')
      setLoadingAction('')
      return
    }
    try {
      const response = await api.weeklyReport({
        userId: selectedUserId,
        completedDeliveries: Number(reportInput.completedDeliveries),
        onlineHours: Number(reportInput.onlineHours),
        disruptionHours: Number(reportInput.disruptionHours),
      })
      setReport(response)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingAction('')
    }
  }

  return (
    <section id="ai" className="panel">
      <h2>AI Support & Weekly Insight</h2>
      <div className="split">
        <div className="stack">
          <h3>Chatbot</h3>
          <textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows="4" />
          <button onClick={askQuestion} disabled={loadingAction === 'report'}>
            {loadingAction === 'ask' ? 'Asking...' : 'Ask AI'}
          </button>
          {answer ? <p className="success">{answer}</p> : null}
        </div>

        <div className="stack">
          <h3>Weekly Report</h3>
          <label>
            Completed Deliveries
            <input type="number" value={reportInput.completedDeliveries} onChange={(e) => setReportInput({ ...reportInput, completedDeliveries: e.target.value })} min="0" />
          </label>
          <label>
            Online Hours
            <input type="number" value={reportInput.onlineHours} onChange={(e) => setReportInput({ ...reportInput, onlineHours: e.target.value })} min="0" />
          </label>
          <label>
            Disruption Hours
            <input type="number" value={reportInput.disruptionHours} onChange={(e) => setReportInput({ ...reportInput, disruptionHours: e.target.value })} min="0" />
          </label>
          <button onClick={generateReport} disabled={loadingAction === 'ask'}>
            {loadingAction === 'report' ? 'Generating...' : 'Generate Report'}
          </button>
          {report ? (
            <div className="summary-card">
              <p>{report.summary}</p>
              <ul className="list">
                {report.recommendedActions.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
      <ErrorState message={error} />
    </section>
  )
}

export default Chatbot
