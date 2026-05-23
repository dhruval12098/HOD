import ConfiguratorMaterialButtons, { buildMetalButtonOptions } from './ConfiguratorMaterialButtons';

export default function ConfiguratorMetalSwatches({ metals, metalOptions = [], active, onChange }) {
  const options = buildMetalButtonOptions(metals, metalOptions);
  const selectedLabel = options.find((entry) => entry.value === active)?.label || active;

  return <ConfiguratorMaterialButtons label="Material" selectedLabel={selectedLabel} options={options} active={active} onChange={onChange} />;
}
