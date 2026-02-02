// ==========================================
// MY SERVICES PAGE UPDATE
// ==========================================
// Add this to your existing MyServices.jsx to enable
// "Book for Client" functionality
// ==========================================

// 1. Add import at the top of the file:
import BookForClient from '../../components/BookForClient';

// 2. Add state for the modal:
const [bookForClientModal, setBookForClientModal] = useState(false);
const [selectedServiceForBooking, setSelectedServiceForBooking] = useState(null);

// 3. Add this handler function:
const handleBookForClient = (service) => {
  setSelectedServiceForBooking(service);
  setBookForClientModal(true);
};

// 4. Add "Book for Client" button in your service card actions:
// (Usually alongside Edit and Delete buttons)

<button
  onClick={() => handleBookForClient(service)}
  className="text-green-600 hover:text-green-700 p-2 hover:bg-green-50 rounded-lg transition-colors"
  title="Book for client"
>
  <UserPlus className="h-5 w-5" />
</button>

// 5. Don't forget to import UserPlus:
import { UserPlus } from 'lucide-react';

// 6. Add the modal at the end of your component (before the closing </div>):

{bookForClientModal && selectedServiceForBooking && (
  <BookForClient
    service={selectedServiceForBooking}
    onClose={() => {
      setBookForClientModal(false);
      setSelectedServiceForBooking(null);
    }}
    onSuccess={() => {
      // Optionally show success message or refresh data
      toast.success('Booking created successfully!');
    }}
  />
)}

// ==========================================
// FULL EXAMPLE - Service Card Actions Section
// ==========================================

{/* Service Actions */}
<div className="flex items-center gap-2">
  {/* Book for Client Button */}
  <button
    onClick={() => handleBookForClient(service)}
    className="text-green-600 hover:text-green-700 p-2 hover:bg-green-50 rounded-lg transition-colors"
    title="Book for client"
  >
    <UserPlus className="h-5 w-5" />
  </button>
  
  {/* Edit Button */}
  <Link
    to={`/dashboard/my-services/edit/${service.id}`}
    className="text-primary-600 hover:text-primary-700 p-2 hover:bg-primary-50 rounded-lg transition-colors"
    title="Edit service"
  >
    <Edit className="h-5 w-5" />
  </Link>
  
  {/* Delete Button */}
  <button
    onClick={() => handleDelete(service.id)}
    className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
    title="Delete service"
  >
    <Trash2 className="h-5 w-5" />
  </button>
</div>
