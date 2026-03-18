import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';

import Header from '../Header.jsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import { deleteEvent, fetchEvent, queryClient } from '../../utils/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';

export default function EventDetails() {

  const { id } = useParams();
  const navigate = useNavigate();

  const { data: event, isPending, error, isError } = useQuery({
    queryKey: ["events", id],
    queryFn: (ctxObject) => fetchEvent({ ...ctxObject, id }),
  });

  const { mutate, isPending: isDeleting } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'], refetchType: 'none' });
      navigate('/events');
    }
  });

  return (
    <>
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
              <button onClick={() => mutate({ id })}>
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
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
                  {event.date} @ { event.time}
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
