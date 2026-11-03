import StatusScreen from '@/components/StatusScreen';

export default function NotFoundPage() {
  return (
    <StatusScreen
      code="404"
      title="Page not found"
      description="The page you're looking for doesn't exist or has moved. Check the address, or head back home."
    />
  );
}
