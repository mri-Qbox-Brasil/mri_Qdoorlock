import Inputs from './components/Inputs';
import Switches from './components/Switches';

const General: React.FC = () => {
  return (
    <div className="space-y-4">
      <Inputs />
      <Switches />
    </div>
  );
};

export default General;
