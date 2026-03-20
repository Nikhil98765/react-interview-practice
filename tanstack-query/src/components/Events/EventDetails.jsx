import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';

import Header from '../Header.jsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import { deleteEvent, fetchEvent, queryClient } from '../../utils/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import Modal from '../UI/Modal.jsx';
import { useState } from 'react';

export default function EventDetails() {

  const { id } = useParams();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: event, isPending, error, isError } = useQuery({
    queryKey: ["events", id],
    queryFn: (ctxObject) => fetchEvent({ ...ctxObject, id }),
  });

  const {
    mutate,
    isPending: isPendingDeletion,
    error: errorDeleting,
    isError: isErrorDeleting,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events"],
        refetchType: "none",
      });
      navigate("/events");
    },
  });

  function handleStartDelete() {
    setIsDeleting(true);
  }

  function handleStopDelete() {
    setIsDeleting(false);
  }

  function handleDelete() {
    mutate({id})
  }

  return (
    <>
      {isDeleting && (
        <Modal onClose={handleStopDelete}>
          <h2>Are you sure?</h2>
          <p>
            Do you really want to delete this event? This action cannot be
            undone.
          </p>
          <div className="form-actions">
            {isPendingDeletion ? (
              <p>Deleting, please wait...</p>
            ) : (
              <>
                <button className="button-text" onClick={handleStopDelete}>
                  Cancel
                </button>
                <button className="button" onClick={handleDelete}>
                  Delete
                </button>
              </>
            )}
          </div>
          {
            isErrorDeleting && (
              <ErrorBlock title="Failed to delete event" message={errorDeleting || 'Failed to delete the event. please try again later.'}/>
            )
          }
        </Modal>
      )}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      {isError && (
        <div id="event-details-content" className="center">
          <ErrorBlock
            title="Failed to load event details"
            message={error.message}
          />
        </div>
      )}
      {isPending && (
        <div id="event-details-content" className="center">
          <LoadingIndicator />
        </div>
      )}
      {event && (
        <article id="event-details">
          <header>
            <h1>{event.title}</h1>
            <nav>
              <button onClick={handleStartDelete}>Delete</button>
              <Link to="edit">Edit</Link>
            </nav>
          </header>
          <div id="event-details-content">
            <img
              src={`http://localhost:3000/${event.image}`}
              alt={event.title}
            />
            <div id="event-details-info">
              <div>
                <p id="event-details-location">{event.location}</p>
                <time dateTime={`Todo-DateT$Todo-Time`}>
                  {event.date} @ {event.time}
                </time>
              </div>
              <p id="event-details-description">{event.description}</p>
            </div>
          </div>
        </article>
      )}
    </>
  );
}
