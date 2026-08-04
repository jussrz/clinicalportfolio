import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import PortfolioLayout from './components/PortfolioLayout'

// Studio (edit tool) pages — unchanged, relocated under /studio/*
import StudioHome from './pages/Home'
import StudioRotationOverview from './pages/RotationOverview'
import CaseLogCensus from './pages/CaseLogCensus'
import DepartmentPage from './pages/DepartmentPage'
import CaseReflections from './pages/CaseReflections'
import CasePresentation from './pages/CasePresentation'
import ClinicalSkills from './pages/ClinicalSkills'
import FeedbackActionPlan from './pages/FeedbackActionPlan'
import IndividualContribution from './pages/IndividualContribution'
import GroupReflections from './pages/GroupReflections'

// Public showcase pages
import Home from './pages/showcase/Home'
import RotationOverview from './pages/showcase/RotationOverview'
import ShowcaseCaseLogCensus from './pages/showcase/CaseLogCensus'
import DepartmentShowcase from './pages/showcase/DepartmentShowcase'
import ShowcaseCaseReflections from './pages/showcase/CaseReflections'
import CaseStudyDetail from './pages/showcase/CaseStudyDetail'
import ShowcaseCasePresentation from './pages/showcase/CasePresentation'
import ShowcaseClinicalSkills from './pages/showcase/ClinicalSkills'
import ShowcaseFeedbackActionPlan from './pages/showcase/FeedbackActionPlan'
import ShowcaseIndividualContribution from './pages/showcase/IndividualContribution'
import ShowcaseGroupReflections from './pages/showcase/GroupReflections'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PortfolioLayout />}>
          <Route index element={<Home />} />
          <Route path="rotation-overview" element={<RotationOverview />} />
          <Route path="case-log-census" element={<ShowcaseCaseLogCensus />} />
          <Route path="departments/:slug" element={<DepartmentShowcase />} />
          <Route path="case-reflections" element={<ShowcaseCaseReflections />} />
          <Route path="case-reflections/:id" element={<CaseStudyDetail />} />
          <Route path="case-presentation" element={<ShowcaseCasePresentation />} />
          <Route path="clinical-skills" element={<ShowcaseClinicalSkills />} />
          <Route path="feedback-action-plan" element={<ShowcaseFeedbackActionPlan />} />
          <Route path="individual-contribution" element={<ShowcaseIndividualContribution />} />
          <Route path="group-reflections" element={<ShowcaseGroupReflections />} />
        </Route>

        <Route path="studio" element={<Layout />}>
          <Route index element={<StudioHome />} />
          <Route path="rotation-overview" element={<StudioRotationOverview />} />
          <Route path="case-log-census" element={<CaseLogCensus />} />
          <Route path="departments/:slug" element={<DepartmentPage />} />
          <Route path="case-reflections" element={<CaseReflections />} />
          <Route path="case-presentation" element={<CasePresentation />} />
          <Route path="clinical-skills" element={<ClinicalSkills />} />
          <Route path="feedback-action-plan" element={<FeedbackActionPlan />} />
          <Route path="individual-contribution" element={<IndividualContribution />} />
          <Route path="group-reflections" element={<GroupReflections />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
