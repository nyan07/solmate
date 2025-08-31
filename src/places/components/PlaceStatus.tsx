import { Tag } from '../../components/Tag';
import type { PlaceStatuses } from '../types/PlaceStatuses';

const PLACE_STATUS_CSS = {
    'open now': 'success',
    'closing soon': 'warning',
    'closed': 'neutral'
}

export const PlaceStatus = ({ status }: { status: PlaceStatuses }) => {
    const classNameSuffix = PLACE_STATUS_CSS[status];
    return (<Tag className={`text-${classNameSuffix} border-${classNameSuffix}`} name={status} />);
}