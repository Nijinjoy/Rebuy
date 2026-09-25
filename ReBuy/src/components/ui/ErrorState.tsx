import { ApiError } from '../../api/client';
import EmptyState from './EmptyState';

type Props = {
  error: unknown;
  onRetry?: () => void;
};

// Message for data that failed to load, with a retry button.
function ErrorState({ error, onRetry }: Props) {
  return (
    <EmptyState
      icon="help"
      title="Something went wrong"
      text={
        error instanceof ApiError
          ? error.message
          : 'We couldn’t load this. Please try again.'
      }
      actionTitle={onRetry ? 'Try again' : undefined}
      onAction={onRetry}
    />
  );
}

export default ErrorState;
