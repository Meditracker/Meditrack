import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import DatePicker from 'react-datepicker';

const PatientCalendar = props => {


  const events = [
    
  ];


  const [newEvent, setNewEvent] = useState({ title: "", start: null });
  const [allEvents, setAllEvents] = useState(events);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [patientsArray, setPatientsArray] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState([]);

  // Request User's data from the database
  useEffect( () => {
    const email = localStorage.getItem('email');
    fetch(`/api/dashboard/${email}`)
    .then((data) => data.json()) 
    .then((data) => {
      // Update the state patientsArray variable with the User's patientsArray property
        setPatientsArray(data.patients);
        // Store an events array full of the medication logs of each patient
        const events = data.patients.reduce((acc, patient) => {
          // Adds the array returned from map to the accumulator array parameter
          return acc.concat(
            // Iterates over the medicationLog for each patient and stores relevant information in an object
            patient.medicationLog.map((log) => ({
              title: log.medication,
              start: new Date(log.date),
              patientFirstName: patient.firstName,
            }))
          );
        }, []);
        // Update the state variable with the newly initialized events array
        setAllEvents(events);
    })
    .catch(() => console.log("got nothing"))

}, []);

  const locales = {
    "en-US": require("date-fns/locale/en-US")
  };

  const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales
  });


  const handlePatientSelection = (patient) => {
    // Update the state selectedPatient variable with the patient value selected by the User
    setSelectedPatient(patient);

    // Return an array of events from the allEvents state variable relevant to the selected patient
    const filteredEvents = allEvents.filter((event) => event.patientFirstName === patient.firstName);

    // Update the selectedEvents state variable with the newly initialized array
    setSelectedEvents(filteredEvents);
  };
  

  function handleAddEvent() {
    if (!newEvent.title || !newEvent.start) {
      return;
    }
  
    // Package data that will be sent to the backend in an update
    const eventPayload = {
      medication: newEvent.title,
      date: newEvent.start,
    };
  
    // Update allEvents
    setAllEvents([...allEvents, newEvent]);
  
    // Update selectedEvents
    setSelectedEvents([...selectedEvents, {
      title: newEvent.title,
      start: newEvent.start,
      patientFirstName: selectedPatient.firstName,
    }]);
  
    const email = localStorage.getItem('email');
    
    // Update the patientsArray state variable
    // setPatientsArray(...update);
    
    // Initialize temp variable to send to backend to update the User's document
    let update = [...patientsArray];
    fetch(`/api/dashboard/${email}`)
      .then((data) => data.json())
      .then((data) => {
        update = [...data.patients];
        for (let i = 0; i < update.length; i++) {
          if (update[i].firstName === selectedPatient.firstName) {
            update[i].medicationLog.push(eventPayload);
          }
        }
      });
        console.log('update', update);

    // Send the update to the backend
    fetch('/api/dashboard/patient', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, update })
    })
      .then(response => response.json())
      .then(data => {
        setNewEvent({ title: '', start: null });
      })
      .catch(error => {
        console.error("Could not process POST request");
      });
  };
  

  
    
  return (
    <div className="med-calendar-container" style={{minHeight: "87vh"}}>
      <h1>Medicine Dosage Log</h1>
  
      <div>
        <h2 className="select-patient-header">Select Patient</h2>
        <select className="select-patient"
          value={selectedPatient?.firstName || ''}
          onChange={(e) => handlePatientSelection(patientsArray.find(p => p.firstName === e.target.value))}
        >
          <option value="">Select Patient</option>
          {patientsArray.map((patient) => (
            <option key={patient.firstName} value={patient.firstName}>{patient.firstName}</option>
          ))}
        </select>
      </div>
  
      {selectedPatient && selectedPatient.medications && (
        <>
          <h2 className="log-meds">Log Medication</h2>
          <div>
            <select className="select-medication"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            >
              <option value="">Select Medication</option>
              {selectedPatient.medications.map((medication) => (
                <option key={medication.name} value={medication.name}>{medication.name}</option>
              ))}
            </select>
            <div className="date-picker" style={{ position: 'relative', zIndex: 9999 }}>
              <DatePicker
                placeholderText='Date and Time'
                showTimeSelect
                dateFormat="Pp"
                style={{ marginRight: "10px", marginBottom: "10px" }}
                selected={newEvent.start}
                onChange={(start) => setNewEvent({ ...newEvent, start })}
              />
            </div>
            <button className="med-cal-btn" style={{ marginTop: "10px" }} onClick={handleAddEvent}>Add Event</button>
          </div>
        </>
      )}
  
      <Calendar
        localizer={localizer}
        events={selectedEvents}
        startAccessor="start"
        endAccessor="start"
        style={{ height: 500, margin: "50px" }}
      />
    </div>
  );
  
  
};

export default PatientCalendar;
