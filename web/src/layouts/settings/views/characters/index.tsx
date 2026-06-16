import { useEffect } from 'react';
import { useSetters } from '../../../../store';
import CharacterFields from './components/CharacterFields';
import Layout from '../../Layout';

const Characters: React.FC = () => {
  const setCharacters = useSetters((setter) => setter.setCharacters);

  // Remove empty fields on unmount
  useEffect(() => {
    return () => {
      setCharacters((prevState) => prevState.filter((item, index) => item !== '' || index === 0));
    };
  }, []);

  return (
    <Layout setter={() => setCharacters((prevState) => [...prevState, ''])}>
      <CharacterFields />
    </Layout>
  );
};

export default Characters;
