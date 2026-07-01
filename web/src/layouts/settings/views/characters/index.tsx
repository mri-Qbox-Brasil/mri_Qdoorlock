import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSetters, useStore } from '../../../../store';
import CharacterFields from './components/CharacterFields';
import Layout from '../../Layout';

const Characters: React.FC = () => {
  const characters = useStore((state) => state.characters);
  const setCharacters = useSetters((setter) => setter.setCharacters);
  const { t } = useTranslation();

  useEffect(() => {
    if (characters.length === 0) {
      setCharacters(() => ['']);
    }
    // Remove empty fields on unmount
    return () => {
      setCharacters((prevState) => prevState.filter((item, index) => item !== '' || index === 0));
    };
  }, []);


  return (
    <Layout 
      setter={() => setCharacters((prevState) => [...prevState, ''])}
      title={t('ui_characters_title') || 'Authorized Characters'}
      description={t('ui_characters_desc') || 'Add the Citizen IDs of the characters who can unlock this door without restrictions.'}
    >
      <CharacterFields />
    </Layout>
  );
};

export default Characters;
