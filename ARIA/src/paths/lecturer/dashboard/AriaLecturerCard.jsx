import AriaAvatar from '../../../components/AriaAvatar.jsx';

export default function AriaLecturerCard({ ariaMessage }) {
  return (
    <div className="ld-aria-card glass glass--strong">
      <AriaAvatar message={ariaMessage} speaking compact />
    </div>
  );
}
