interface Location {
  latitude: number;
  longitude: number;
}

interface Signature {
  id: number;
  signatureStatus: string;
  duration: string;
  caregiverSignature: string;
  clientSignature: string;
}

interface PayPeriodHistory {
  id: number;
  startDate: string;
  endDate: string | null;
  numberOfWeeks: number;
}

interface Caregiver {
  id: number;
  firstName: string;
  middleName: string;
  lastName: string;
  [key: string]: any; // for other caregiver properties
}

interface Client {
  id: number;
  firstName: string;
  middleName: string;
  lastName: string;
  [key: string]: any; // for other client properties
}

interface TimeEntry {
  id: number;
  dateOfService: string;
  manualEntry: boolean;
  clockIn: string;
  clockOut: string;
  notes: string;
  tsApprovalStatus: string;
  serviceName: string;
  startLocation: Location;
  endLocation: Location;
  payPeriodHistory: PayPeriodHistory;
  signature: Signature;
  caregiver: Caregiver;
  client: Client;
  checkedActivity: { id: number };
}

interface GroupedTimeEntry {
  id: number;
  dateOfService: string;
  caregiver: Pick<Caregiver, 'id' | 'firstName' | 'middleName' | 'lastName'>;
  client: Pick<Client, 'id' | 'firstName' | 'middleName' | 'lastName'>;
  tsApprovalStatus: string;
  serviceName: string;
  subRows: TimeEntry[];
}

export function transformTimesheetData(entries: TimeEntry[]): GroupedTimeEntry {
  if (!entries.length) {
    throw new Error('No entries provided');
  }

  // Sort entries by date
  const sortedEntries = [...entries].sort((a, b) =>
    new Date(a.dateOfService).getTime() - new Date(b.dateOfService).getTime()
  );

  // Get unique service names
  const uniqueServices = [...new Set(sortedEntries.map(entry => entry.serviceName))];

  // Create date range
  const startDate = new Date(sortedEntries[0].dateOfService);
  const endDate = new Date(sortedEntries[sortedEntries.length - 1].dateOfService);

  // Format date range
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const dateRange = `${formatDate(startDate)} - ${formatDate(endDate)}`;

  // Check if all entries have the same approval status
  const hasAllSameStatus = sortedEntries.every(
    entry => entry.tsApprovalStatus === sortedEntries[0].tsApprovalStatus
  );

  // Get first entry for caregiver and client info
  const { caregiver, client } = sortedEntries[0];

  return {
    id: 0, // You might want to generate this based on your needs
    dateOfService: dateRange,
    caregiver: {
      id: caregiver.id,
      firstName: caregiver.firstName,
      middleName: caregiver.middleName,
      lastName: caregiver.lastName
    },
    client: {
      id: client.id,
      firstName: client.firstName,
      middleName: client.middleName,
      lastName: client.lastName
    },
    tsApprovalStatus: hasAllSameStatus ? sortedEntries[0].tsApprovalStatus : 'Mix',
    serviceName: uniqueServices.join(', '),
    subRows: sortedEntries
  };
}

// Example usage:
// const transformedData = transformTimesheetData(originalTimeEntries);
