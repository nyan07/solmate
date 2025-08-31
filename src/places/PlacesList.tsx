import { PlaceItem } from "./components/PlaceItem";
import SwipeUp from "../components/SwipeUp";
import type { Place } from "./types/Place";

const placeholder: Place[] = [
    {
        id: 1,
        name: "Brew & Bloom",
        type: "cafe",
        tags: ["Terrace", "Allow Dogs"],
        distance: "300m",
        status: 'open now',
        description: "Casual café serving freshly brewed coffee, light breakfast options, and a selection of vegan pastries and sandwiches.",
        imageUrl: "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=300&auto=format&fit=crop",
    },
    {
        id: 2,
        name: "Green Fork Bistro",
        type: "restaurant",
        distance: "1.2 km",
        tags: ["Good for Groups", "Dine In"],
        status: 'closing soon',
        description: "Relaxed restaurant offering seasonal lunch and dinner menus, with vegetarian and vegan-friendly dishes.",
        imageUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=300&auto=format&fit=crop",
    },
    {
        id: 3,
        name: "Twilight Grove Bar",
        type: "bar",
        distance: "2.1 km",
        tags: ["Terrace", "Live Music"],
        status: 'closing soon',
        description: "Chill bar featuring craft cocktails, small plates, and plant-based bites in a laid-back atmosphere.",
        imageUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=300&auto=format&fit=crop",
    },
    {
        id: 4,
        name: "Brew & Bloom",
        type: "cafe",
        tags: ["Terrace", "Allow Dogs"],
        status: 'open now',
        distance: "300m",
        description: "Casual café serving freshly brewed coffee, light breakfast options, and a selection of vegan pastries and sandwiches.",
        imageUrl: "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=300&auto=format&fit=crop",
    },
    {
        id: 5,
        name: "Green Fork Bistro",
        type: "restaurant",
        distance: "1.2 km",
        status: 'open now',
        tags: ["Good for Groups", "Dine In"],
        description: "Relaxed restaurant offering seasonal lunch and dinner menus, with vegetarian and vegan-friendly dishes.",
        imageUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=300&auto=format&fit=crop",
    },
    {
        id: 6,
        name: "Twilight Grove Bar",
        type: "bar",
        distance: "2.1 km",
        status: 'closed',
        tags: ["Terrace", "Live Music"],
        description: "Chill bar featuring craft cocktails, small plates, and plant-based bites in a laid-back atmosphere.",
        imageUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=300&auto=format&fit=crop",
    },
];

function PlacesList() {
    return (
        <SwipeUp>
            <ul className='w-full p-4'>
                {placeholder.map((item) => (
                    <li key={`place-${item.id}`}>
                        <PlaceItem place={item} />
                    </li>
                ))}
            </ul>
        </SwipeUp>
    )
}
export default PlacesList;