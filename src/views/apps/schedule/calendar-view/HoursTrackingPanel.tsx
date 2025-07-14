// import React from 'react';
// import { Clock, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
// import { getServiceAgreement, calculateUsedHours } from '../data/sampleData';

// const HourTrackingPanel = ({ clientId, serviceTypeId, events }) => {
//   const agreement = getServiceAgreement(clientId, serviceTypeId);

//   if (!agreement) {
//     return (
//       <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
//         <div className="flex items-center space-x-2">
//           <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
//           <span className="text-sm text-yellow-800 dark:text-yellow-200">
//             No service agreement found for this client and service type
//           </span>
//         </div>
//       </div>
//     );
//   }

//   // Calculate real-time used hours from events
//   const realTimeUsedHours = calculateUsedHours(events, clientId, serviceTypeId);
//   const remainingHours = Math.max(0, agreement.authorizedHours - realTimeUsedHours);
//   const usagePercentage = (realTimeUsedHours / agreement.authorizedHours) * 100;

//   // Determine status color based on usage
//   const getStatusColor = () => {
//     if (usagePercentage >= 95) return 'text-red-600 dark:text-red-400';
//     if (usagePercentage >= 80) return 'text-yellow-600 dark:text-yellow-400';
//     return 'text-green-600 dark:text-green-400';
//   };

//   const getProgressBarColor = () => {
//     if (usagePercentage >= 95) return 'bg-red-500';
//     if (usagePercentage >= 80) return 'bg-yellow-500';
//     return 'bg-green-500';
//   };

//   return (
//     <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-4">
//         <div className="flex items-center space-x-2">
//           <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
//           <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//             Service Agreement: {agreement.agreementNumber}
//           </h3>
//         </div>
//         {agreement.uploadedDocument && (
//           <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
//             <FileText className="w-4 h-4" />
//             <span>PDF Attached</span>
//           </div>
//         )}
//       </div>

//       {/* Hour Statistics Grid */}
//       <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
//         <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
//           <div className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
//             Authorized
//           </div>
//           <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
//             {agreement.authorizedHours.toFixed(2)} hrs
//           </div>
//         </div>

//         <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
//           <div className="text-xs font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wide">
//             Used
//           </div>
//           <div className="text-lg font-bold text-orange-900 dark:text-orange-100">
//             {realTimeUsedHours.toFixed(2)} hrs
//           </div>
//         </div>

//         <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
//           <div className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">
//             Remaining
//           </div>
//           <div className="text-lg font-bold text-green-900 dark:text-green-100">
//             {remainingHours.toFixed(2)} hrs
//           </div>
//         </div>

//         <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
//           <div className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wide">
//             Per Day
//           </div>
//           <div className="text-lg font-bold text-purple-900 dark:text-purple-100">
//             {agreement.hoursPerDay === 'N/A' ? 'N/A' : `${agreement.hoursPerDay} hrs`}
//           </div>
//         </div>

//         <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3">
//           <div className="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
//             Per Week
//           </div>
//           <div className="text-lg font-bold text-indigo-900 dark:text-indigo-100">
//             {agreement.hoursPerWeek.toFixed(2)} hrs
//           </div>
//         </div>
//       </div>

//       {/* Progress Bar */}
//       <div className="mb-4">
//         <div className="flex justify-between items-center mb-2">
//           <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
//             Usage Progress
//           </span>
//           <span className={`text-sm font-medium ${getStatusColor()}`}>
//             {usagePercentage.toFixed(1)}%
//           </span>
//         </div>
//         <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
//           <div
//             className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor()}`}
//             style={{ width: `${Math.min(100, usagePercentage)}%` }}
//           ></div>
//         </div>
//       </div>

//       {/* Additional Information */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
//         <div>
//           <span className="font-medium text-gray-700 dark:text-gray-300">Frequency:</span>
//           <span className="ml-2 text-gray-600 dark:text-gray-400">{agreement.frequency}</span>
//         </div>
//         <div>
//           <span className="font-medium text-gray-700 dark:text-gray-300">Staff Ratio:</span>
//           <span className="ml-2 text-gray-600 dark:text-gray-400">{agreement.staffRatio}</span>
//         </div>
//         <div>
//           <span className="font-medium text-gray-700 dark:text-gray-300">Valid Until:</span>
//           <span className="ml-2 text-gray-600 dark:text-gray-400">
//                                     {new Date(agreement.endDate).toLocaleDateString('en-US')}
//           </span>
//         </div>
//       </div>

//       {/* Warning Messages */}
//       {usagePercentage >= 95 && (
//         <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
//           <div className="flex items-center space-x-2">
//             <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
//             <span className="text-sm text-red-800 dark:text-red-200 font-medium">
//               Critical: Only {remainingHours.toFixed(2)} hours remaining!
//             </span>
//           </div>
//         </div>
//       )}

//       {usagePercentage >= 80 && usagePercentage < 95 && (
//         <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
//           <div className="flex items-center space-x-2">
//             <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
//             <span className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
//               Warning: {remainingHours.toFixed(2)} hours remaining ({(100 - usagePercentage).toFixed(1)}% left)
//             </span>
//           </div>
//         </div>
//       )}

//       {agreement.notes && (
//         <div className="mt-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
//           <div className="text-sm text-gray-700 dark:text-gray-300">
//             <span className="font-medium">Notes:</span> {agreement.notes}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default HourTrackingPanel;
