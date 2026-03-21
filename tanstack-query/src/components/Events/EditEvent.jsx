import { Link, useNavigate, useParams } from 'react-router-dom';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchEvent, queryClient, updateEvent } from '../../utils/http.js';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function EditEvent() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data, error, isError, isPending } = useQuery({
    queryKey: ['events', id],
    queryFn: ({ signal }) => fetchEvent({ id, signal })
  });

  const { mutate } = useMutation({
    mutationFn: updateEvent,
    onMutate: async ({ event, id }) => {

      await queryClient.cancelQueries(['events', id]);
      const previousEventData = queryClient.getQueryData(['events', id]);

      queryClient.setQueryData(['events', id], event);

      return {previousEventData}
    },
    onError: (error, data, context) => {
      queryClient.setQueryData(['events', id], context.previousEventData);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['events', id]);
    }
  })

  function handleSubmit(formData) {
    mutate({ id, event: formData });
    navigate('../');
  }

  function handleClose() {
    navigate('../');
  }

  let content;

  if (isPending) {
    content = <div className='center'>
      <LoadingIndicator />
    </div>
  }

  if (isError) {
    content = (
      <>
        <ErrorBlock
          title="Failed to load event"
          message={
            error.info?.message ||
            "Failed to load event. Please try again later."
          }
        />
        <div className="form-actions">
          <Link className='button' to='../'>Okay</Link>
        </div>
      </>
    );
  }

  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        <Link to="../" className="button-text">
          Cancel
        </Link>
        <button type="submit" className="button">
          Update
        </button>
      </EventForm>
    );
  }

  return (
    <Modal onClose={handleClose}>
      {content}
    </Modal>
  );
}
