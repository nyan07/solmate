import { Suspense } from 'react';
import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom';
import PlacesList from './places/PlacesList';
import PlaceDetails from './places/PlaceDetails';
import Mappr from './map/Mappr';

function App() {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <Mappr />
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
