import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Kanban from "./pages/Kanban";
import Analytics from "./pages/Analytics";
import DoneOrders from "./pages/DoneOrders";
import { Toaster } from "./components/ui/toaster";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <Routes>
          <Route path="/" element={<Kanban />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/done" element={<DoneOrders />} />
        </Routes>
        <Toaster />
      </div>
    </BrowserRouter>
  );
}

export default App;
