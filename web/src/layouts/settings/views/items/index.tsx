import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSetters, useStore } from '../../../../store';
import ItemFields from './components/ItemFields';
import Layout from '../../Layout';

const Items: React.FC = () => {
  const items = useStore((state) => state.items);
  const setItemFields = useSetters((setter) => setter.setItems);
  const { t } = useTranslation();

  useEffect(() => {
    if (items.length === 0) {
      setItemFields(() => [{ name: '', metadata: '', remove: false }]);
    }
    // Clear empty item fields when leaving the page
    return () => {
      setItemFields((prevState) => prevState.filter((item, index) => index === 0 || item.name !== ''));
    };
  }, []);

  return (
    <Layout 
      setter={() => setItemFields((prevState) => [...prevState, { name: '', metadata: '', remove: false }])}
      title={t('ui_items_title') || 'Required Items'}
      description={t('ui_items_desc') || 'List the items required to unlock this door. You can configure if they should be consumed upon use.'}
    >
      <ItemFields />
    </Layout>
  );
};

export default Items;
