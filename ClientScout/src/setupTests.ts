import "@testing-library/jest-dom";

// Ensure React 18/19 act() environment is available for testing
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
