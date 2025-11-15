import { Workshop } from "@/lib/data";

interface CourseCardProps {
  workshop: Workshop;
}

/**
 * CourseCard-Komponente
 * Zeigt eine Kurs-Karte mit allen relevanten Informationen an
 * Mobile-first Design mit direkten Buchungslinks
 */
export default function CourseCard({ workshop }: CourseCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full">
      <div className="p-4 sm:p-6 flex-grow flex flex-col">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 leading-tight">
          {workshop.title}
        </h3>
        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 flex-grow leading-relaxed">
          {workshop.description}
        </p>
        
        {/* Info Icons - Mobile optimiert */}
        <div className="flex flex-col gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="flex items-center text-sm sm:text-base text-gray-700">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-amber-600 flex-shrink-0"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{workshop.duration}</span>
          </div>
          
          {workshop.day && (
            <div className="flex items-center text-sm sm:text-base text-gray-700">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-amber-600 flex-shrink-0"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">{workshop.day}</span>
            </div>
          )}
          
          <div className="flex items-center text-base sm:text-lg font-bold text-amber-700">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 flex-shrink-0"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{workshop.price}</span>
          </div>
        </div>

        {/* Buchungsbutton - Mobile optimiert mit großem Touch-Target */}
        {workshop.bookingLink ? (
          <a
            href={workshop.bookingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-lg text-center text-sm sm:text-base transition-colors duration-200 shadow-md hover:shadow-lg active:bg-amber-800 touch-manipulation"
          >
            Jetzt buchen →
          </a>
        ) : (
          <a
            href="/kontakt"
            className="block w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-lg text-center text-sm sm:text-base transition-colors duration-200 shadow-md hover:shadow-lg active:bg-gray-800 touch-manipulation"
          >
            Kontakt aufnehmen
          </a>
        )}
      </div>
    </div>
  );
}

