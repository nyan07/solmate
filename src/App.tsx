import { Suspense } from 'react';
import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom';
import PlacesList from './places/PlacesList';
import PlaceDetails from './places/PlaceDetails';
import CesiumMap from './map/CesiumMap';

function App() {
  return (
    // <div className='font-sans overflow-hidden text-neutral-dark'>
    <>
      {/* <header className="bg-neutral-light p-4 flex fixed w-full top-0 left-0 right-0 h-16 shadow-lg z-100">
        <h1 className='text-primary font-bold grow text-center text-lg'>SolMate</h1>
      </header> */}

      <Suspense fallback={<div>Loading...</div>}>
        <CesiumMap />
        <Routes>
          <Route path="/" element={<Navigate to="/places" replace />} />
          <Route path="/places" element={<PlacesList />} />
          <Route path="/places/:placeId" element={<PlaceDetails />} />
        </Routes>
      </Suspense>
      <div className='fixed bottom-0 h-16 p-2 bg-neutral-lightest w-full z-50'>
        <img src="/arkie.png" className='max-h-10 m-auto' />
      </div>

    </>
  )
}

export default App
