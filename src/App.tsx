import RunningSchedulePlanner from './components/RunningSchedulePlanner'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-full mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          ランニングスケジュールプランナー
        </h1>
        <RunningSchedulePlanner />
      </div>
    </div>
  )
}

export default App