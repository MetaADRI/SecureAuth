import AriaAvatar from '../../../components/AriaAvatar.jsx';

export default function AriaPanel({ ariaMessage }) {
  return (
    <div className="sd-panel glass glass--strong sd-aria-panel">
      <AriaAvatar message={ariaMessage} speaking compact />
    </div>
  );
}
