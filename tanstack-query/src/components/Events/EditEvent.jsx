import { Link, redirect, useNavigate, useNavigation, useParams, useSubmit } from 'react-router-dom';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { useQuery } from '@tanstack/react-query';
import { fetchEvent, queryClient, updateEvent } from '../../utils/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';

const eventQuery = (id) => ({
  queryKey: ["events", id],
  queryFn: ({ signal }) => fetchEvent({ id, signal }),
  staleTime: 10000
});

export default function EditEvent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const submit = useSubmit();
  const { state } = useNavigation();
  
  const { data, error, isError } = useQuery(eventQuery(id));

  // const { mutate } = useMutation({
  //   mutationFn: updateEvent,
  //   onMutate: async ({ event, id }) => {

  //     await queryClient.cancelQueries(['events', id]);
  //     const previousEventData = queryClient.getQueryData(['events', id]);

  //     queryClient.setQueryData(['events', id], event);

  //     return {previousEventData}
  //   },
  //   onError: (error, data, context) => {
  //     queryClient.setQueryData(['events', id], context.previousEventData);
  //   },
  //   onSettled: () => {
  //     queryClient.invalidateQueries(['events', id]);
  //   }
  // })

  function handleSubmit(formData) {
    // mutate({ id, event: formData });
    // navigate('../');
    submit(formData, {method: 'PUT'});
  }

  function handleClose() {
    navigate('../');
  }

  let content;

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
        {state === "submitting" ? (
          <p>Submitting...</p>
        ) : (
          <>
            <Link to="../" className="button-text">
              Cancel
            </Link>
            <button type="submit" className="button">
              Update
            </button>
          </>
        )}
      </EventForm>
    );
  }

  return (
    <Modal onClose={handleClose}>
      {content}
    </Modal>
  );
}

export const loader = async ({params}) => {
  await queryClient.ensureQueryData(eventQuery(params.id));
  return null;
}

export const action = async ({request, params}) => {
  const formData = await request.formData();
  const formObj = Object.fromEntries(formData);
  await updateEvent({ id: params.id, event: formObj });
  queryClient.invalidateQueries(['events']);
  return redirect('../');
}
