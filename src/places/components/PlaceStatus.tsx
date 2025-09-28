import { Tag } from '../../components/Tag';
import type { PlaceStatuses } from '../types/PlaceStatuses';

const PLACE_STATUS_CSS = {
    'open': 'success',
    'closed': 'neutral'
}

export const PlaceStatus = ({ status }: { status: PlaceStatuses }) => {
    const classNameSuffix = PLACE_STATUS_CSS[status];
    const className = `text-${classNameSuffix} border-${classNameSuffix}`;

    return (<Tag className={className} name={status} />);
}