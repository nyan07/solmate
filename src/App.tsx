import { Suspense } from 'react';
import './App.css'
import Mappr from './Mappr';
import { Navigate, Route, Routes } from 'react-router-dom';
import PlacesList from './places/PlacesList';
import PlaceDetails from './places/PlaceDetails';


function App() {
  return (
    // <div className='font-sans overflow-hidden text-neutral-dark'>
    <>
      <header className="bg-neutral-light p-4 flex fixed w-full top-0 left-0 right-0 h-16 shadow-lg z-100">
        <h1 className='text-primary font-bold grow text-center text-lg'>SolMate</h1>
      </header>
      {/* <Mappr /> */}

      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Navigate to="/places" replace />} />
          <Route path="/places" element={<PlacesList />} />
          <Route path="/places/:placeId" element={<PlaceDetails />} />
        </Routes>
      </Suspense>
    </>
  )
}

export default App
