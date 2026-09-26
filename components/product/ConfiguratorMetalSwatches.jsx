import ConfiguratorMaterialButtons, { buildMetalButtonOptions } from './ConfiguratorMaterialButtons';

export default function ConfiguratorMetalSwatches({ metals, metalOptions = [], active, onChange }) {
  const options = buildMetalButtonOptions(metals, metalOptions);
  return <ConfiguratorMaterialButtons label="Metal" options={options} active={active} onChange={onChange} />;
}
