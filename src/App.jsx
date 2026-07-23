import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import RotationOverview from './pages/RotationOverview'
import CaseLogCensus from './pages/CaseLogCensus'
import DepartmentPage from './pages/DepartmentPage'
import CaseReflections from './pages/CaseReflections'
import CasePresentation from './pages/CasePresentation'
import ClinicalSkills from './pages/ClinicalSkills'
import FeedbackActionPlan from './pages/FeedbackActionPlan'
import IndividualContribution from './pages/IndividualContribution'
import GroupReflections from './pages/GroupReflections'
import Confidentiality from './pages/Confidentiality'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="rotation-overview" element={<RotationOverview />} />
          <Route path="case-log-census" element={<CaseLogCensus />} />
          <Route path="departments/:slug" element={<DepartmentPage />} />
          <Route path="case-reflections" element={<CaseReflections />} />
          <Route path="case-presentation" element={<CasePresentation />} />
          <Route path="clinical-skills" element={<ClinicalSkills />} />
          <Route path="feedback-action-plan" element={<FeedbackActionPlan />} />
          <Route path="individual-contributions" element={<IndividualContribution />} />
          <Route path="group-reflections" element={<GroupReflections />} />
          <Route path="confidentiality" element={<Confidentiality />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
