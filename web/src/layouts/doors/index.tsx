import Header from './components/Header';
import DoorTable from './components/DoorTable';

const Doors: React.FC = () => {
  return (
    <div className="flex flex-col h-full">
      <Header />
      <DoorTable />
    </div>
  );
};

export default Doors;
