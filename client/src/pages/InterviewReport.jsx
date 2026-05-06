import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from "axios"
import { ServerUrl } from '../App';
import Step3Report from '../components/Step3Report';

function InterviewReport() {
  const { id } = useParams()
  const [report, setReport] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const result = await axios.get(ServerUrl + "/api/interview/report/" + id, { withCredentials: true })
        setReport(result.data)
      } catch (error) {
        console.log(error)
      }
    }
    fetchReport()
  }, [id])

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className='text-center'>
          <div className='w-12 h-12 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className="text-gray-500 dark:text-gray-400 text-lg">Loading Report...</p>
        </div>
      </div>
    );
  }

  return <Step3Report report={report} />
}

export default InterviewReport
