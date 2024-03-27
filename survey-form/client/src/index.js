import React from "react";
import { createRoot } from "react-dom/client";
import SurveyComponent from "./SurveyComponent";

const root = createRoot(document.getElementById("surveyElement"));
root.render(<SurveyComponent />);