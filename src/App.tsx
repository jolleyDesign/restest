import { DeviceGrid } from "./components/DeviceGrid";
import { DevicePicker } from "./components/DevicePicker";
import { Toolbar } from "./components/Toolbar";

export default function App() {
  return (
    <>
      <Toolbar />
      <div className="flex flex-1 min-h-0">
        <DevicePicker />
        <DeviceGrid />
      </div>
    </>
  );
}
