import LoadingAnimation from '../../components/ui/LoadingAnimation';

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen bg-ancient-beige">
      <LoadingAnimation />
    </div>
  );
}