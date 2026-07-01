import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSetters, useStore } from '../../../../store';
import GroupFields from './components/GroupFields';
import Layout from '../../Layout';

const Groups: React.FC = () => {
  const groups = useStore((state) => state.groups);
  const setGroups = useSetters((setter) => setter.setGroups);
  const { t } = useTranslation();

  useEffect(() => {
    if (groups.length === 0) {
      setGroups(() => [{ name: '', grade: null }]);
    }
    // Remove empty fields on unmount
    return () => {
      setGroups((prevState) =>
        prevState.filter((item, index) => item.name !== '' || item.grade !== null || index === 0)
      );
    };
  }, []);

  return (
    <Layout 
      setter={() => setGroups((prevState) => [...prevState, { name: '', grade: null }])}
      title={t('ui_groups_title') || 'Authorized Groups'}
      description={t('ui_groups_desc') || 'Specify which jobs/gangs are allowed to interact with this door. You can also define the minimum required grade.'}
    >
      <GroupFields />
    </Layout>
  );
};

export default Groups;
