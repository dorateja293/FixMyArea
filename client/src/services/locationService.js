import axios from 'axios';

// Cache for location data to avoid repeated API calls
const locationCache = {
  states: null,
  districts: {},
  villages: {}
};

// Base URL for Indian government location API
const BASE_URL = 'https://igod.gov.in/sg/district';

class LocationService {
  // Get all states
  static async getStates() {
    try {
      if (locationCache.states) {
        return locationCache.states;
      }

      console.log('🌍 Fetching states from API...');
      const response = await axios.get(`${BASE_URL}/states`);
      
      if (response.data && response.data.success) {
        const states = response.data.data.map(state => ({
          id: state.id,
          name: state.name,
          code: state.code
        }));
        
        locationCache.states = states;
        console.log('✅ States loaded:', states.length);
        return states;
      } else {
        // Fallback to static data if API fails
        console.log('⚠️ API failed, using fallback states data');
        return this.getFallbackStates();
      }
    } catch (error) {
      console.error('🚨 Error fetching states:', error);
      return this.getFallbackStates();
    }
  }

  // Get districts for a state
  static async getDistricts(stateId) {
    try {
      if (locationCache.districts[stateId]) {
        return locationCache.districts[stateId];
      }

      console.log(`🌍 Fetching districts for state ${stateId}...`);
      const response = await axios.get(`${BASE_URL}/districts/${stateId}`);
      
      if (response.data && response.data.success) {
        const districts = response.data.data.map(district => ({
          id: district.id,
          name: district.name,
          code: district.code,
          stateId: stateId
        }));
        
        locationCache.districts[stateId] = districts;
        console.log('✅ Districts loaded:', districts.length);
        return districts;
      } else {
        console.log('⚠️ API failed, using fallback districts data');
        return this.getFallbackDistricts(stateId);
      }
    } catch (error) {
      console.error('🚨 Error fetching districts:', error);
      return this.getFallbackDistricts(stateId);
    }
  }

  // Get villages for a district
  static async getVillages(districtId) {
    try {
      if (locationCache.villages[districtId]) {
        return locationCache.villages[districtId];
      }

      console.log(`🌍 Fetching villages for district ${districtId}...`);
      const response = await axios.get(`${BASE_URL}/villages/${districtId}`);
      
      if (response.data && response.data.success) {
        const villages = response.data.data.map(village => ({
          id: village.id,
          name: village.name,
          code: village.code,
          districtId: districtId
        }));
        
        locationCache.villages[districtId] = villages;
        console.log('✅ Villages loaded:', villages.length);
        return villages;
      } else {
        console.log('⚠️ API failed, using fallback villages data');
        return this.getFallbackVillages(districtId);
      }
    } catch (error) {
      console.error('🚨 Error fetching villages:', error);
      return this.getFallbackVillages(districtId);
    }
  }

  // Fallback data for states
  static getFallbackStates() {
    return [
      { id: 1, name: 'Andhra Pradesh', code: 'AP' },
      { id: 2, name: 'Arunachal Pradesh', code: 'AR' },
      { id: 3, name: 'Assam', code: 'AS' },
      { id: 4, name: 'Bihar', code: 'BR' },
      { id: 5, name: 'Chhattisgarh', code: 'CG' },
      { id: 6, name: 'Goa', code: 'GA' },
      { id: 7, name: 'Gujarat', code: 'GJ' },
      { id: 8, name: 'Haryana', code: 'HR' },
      { id: 9, name: 'Himachal Pradesh', code: 'HP' },
      { id: 10, name: 'Jharkhand', code: 'JH' },
      { id: 11, name: 'Karnataka', code: 'KA' },
      { id: 12, name: 'Kerala', code: 'KL' },
      { id: 13, name: 'Madhya Pradesh', code: 'MP' },
      { id: 14, name: 'Maharashtra', code: 'MH' },
      { id: 15, name: 'Manipur', code: 'MN' },
      { id: 16, name: 'Meghalaya', code: 'ML' },
      { id: 17, name: 'Mizoram', code: 'MZ' },
      { id: 18, name: 'Nagaland', code: 'NL' },
      { id: 19, name: 'Odisha', code: 'OD' },
      { id: 20, name: 'Punjab', code: 'PB' },
      { id: 21, name: 'Rajasthan', code: 'RJ' },
      { id: 22, name: 'Sikkim', code: 'SK' },
      { id: 23, name: 'Tamil Nadu', code: 'TN' },
      { id: 24, name: 'Telangana', code: 'TS' },
      { id: 25, name: 'Tripura', code: 'TR' },
      { id: 26, name: 'Uttar Pradesh', code: 'UP' },
      { id: 27, name: 'Uttarakhand', code: 'UK' },
      { id: 28, name: 'West Bengal', code: 'WB' },
      { id: 29, name: 'Delhi', code: 'DL' },
      { id: 30, name: 'Jammu and Kashmir', code: 'JK' },
      { id: 31, name: 'Ladakh', code: 'LA' },
      { id: 32, name: 'Chandigarh', code: 'CH' },
      { id: 33, name: 'Dadra and Nagar Haveli and Daman and Diu', code: 'DN' },
      { id: 34, name: 'Lakshadweep', code: 'LD' },
      { id: 35, name: 'Puducherry', code: 'PY' },
      { id: 36, name: 'Andaman and Nicobar Islands', code: 'AN' }
    ];
  }

  // Fallback data for districts (sample for Andhra Pradesh and Maharashtra)
  static getFallbackDistricts(stateId) {
    const districts = {
      1: [ // Andhra Pradesh
        { id: 1, name: 'Anantapur', code: 'ANP', stateId: 1 },
        { id: 2, name: 'Chittoor', code: 'CTR', stateId: 1 },
        { id: 3, name: 'East Godavari', code: 'EGD', stateId: 1 },
        { id: 4, name: 'Guntur', code: 'GNT', stateId: 1 },
        { id: 5, name: 'Krishna', code: 'KRS', stateId: 1 },
        { id: 6, name: 'Kurnool', code: 'KRN', stateId: 1 },
        { id: 7, name: 'Prakasam', code: 'PRK', stateId: 1 },
        { id: 8, name: 'Srikakulam', code: 'SRK', stateId: 1 },
        { id: 9, name: 'Visakhapatnam', code: 'VSK', stateId: 1 },
        { id: 10, name: 'Vizianagaram', code: 'VZN', stateId: 1 },
        { id: 11, name: 'West Godavari', code: 'WGD', stateId: 1 },
        { id: 12, name: 'YSR Kadapa', code: 'YSR', stateId: 1 }
      ],
      14: [ // Maharashtra
        { id: 101, name: 'Ahmednagar', code: 'AHM', stateId: 14 },
        { id: 102, name: 'Akola', code: 'AKL', stateId: 14 },
        { id: 103, name: 'Amravati', code: 'AMR', stateId: 14 },
        { id: 104, name: 'Aurangabad', code: 'AUR', stateId: 14 },
        { id: 105, name: 'Beed', code: 'BED', stateId: 14 },
        { id: 106, name: 'Bhandara', code: 'BHD', stateId: 14 },
        { id: 107, name: 'Buldhana', code: 'BLD', stateId: 14 },
        { id: 108, name: 'Chandrapur', code: 'CHD', stateId: 14 },
        { id: 109, name: 'Dhule', code: 'DHL', stateId: 14 },
        { id: 110, name: 'Gadchiroli', code: 'GDC', stateId: 14 },
        { id: 111, name: 'Gondia', code: 'GND', stateId: 14 },
        { id: 112, name: 'Hingoli', code: 'HNG', stateId: 14 },
        { id: 113, name: 'Jalgaon', code: 'JLG', stateId: 14 },
        { id: 114, name: 'Jalna', code: 'JLN', stateId: 14 },
        { id: 115, name: 'Kolhapur', code: 'KLH', stateId: 14 },
        { id: 116, name: 'Latur', code: 'LTR', stateId: 14 },
        { id: 117, name: 'Mumbai City', code: 'MBC', stateId: 14 },
        { id: 118, name: 'Mumbai Suburban', code: 'MBS', stateId: 14 },
        { id: 119, name: 'Nagpur', code: 'NGP', stateId: 14 },
        { id: 120, name: 'Nanded', code: 'NND', stateId: 14 },
        { id: 121, name: 'Nashik', code: 'NSK', stateId: 14 },
        { id: 122, name: 'Osmanabad', code: 'OSM', stateId: 14 },
        { id: 123, name: 'Palghar', code: 'PLG', stateId: 14 },
        { id: 124, name: 'Parbhani', code: 'PRB', stateId: 14 },
        { id: 125, name: 'Pune', code: 'PUN', stateId: 14 },
        { id: 126, name: 'Raigad', code: 'RGD', stateId: 14 },
        { id: 127, name: 'Ratnagiri', code: 'RTG', stateId: 14 },
        { id: 128, name: 'Sangli', code: 'SGL', stateId: 14 },
        { id: 129, name: 'Satara', code: 'STR', stateId: 14 },
        { id: 130, name: 'Sindhudurg', code: 'SND', stateId: 14 },
        { id: 131, name: 'Solapur', code: 'SLP', stateId: 14 },
        { id: 132, name: 'Thane', code: 'THN', stateId: 14 },
        { id: 133, name: 'Wardha', code: 'WRD', stateId: 14 },
        { id: 134, name: 'Washim', code: 'WSH', stateId: 14 },
        { id: 135, name: 'Yavatmal', code: 'YVT', stateId: 14 }
      ],
      26: [ // Uttar Pradesh
        { id: 201, name: 'Agra', code: 'AGR', stateId: 26 },
        { id: 202, name: 'Aligarh', code: 'ALG', stateId: 26 },
        { id: 203, name: 'Allahabad', code: 'ALD', stateId: 26 },
        { id: 204, name: 'Ambedkar Nagar', code: 'AMN', stateId: 26 },
        { id: 205, name: 'Amethi', code: 'AMT', stateId: 26 },
        { id: 206, name: 'Amroha', code: 'AMR', stateId: 26 },
        { id: 207, name: 'Auraiya', code: 'AUR', stateId: 26 },
        { id: 208, name: 'Azamgarh', code: 'AZM', stateId: 26 },
        { id: 209, name: 'Baghpat', code: 'BGP', stateId: 26 },
        { id: 210, name: 'Bahraich', code: 'BHR', stateId: 26 },
        { id: 211, name: 'Ballia', code: 'BLL', stateId: 26 },
        { id: 212, name: 'Balrampur', code: 'BLP', stateId: 26 },
        { id: 213, name: 'Banda', code: 'BND', stateId: 26 },
        { id: 214, name: 'Barabanki', code: 'BRB', stateId: 26 },
        { id: 215, name: 'Bareilly', code: 'BRL', stateId: 26 },
        { id: 216, name: 'Basti', code: 'BST', stateId: 26 },
        { id: 217, name: 'Bhadohi', code: 'BHD', stateId: 26 },
        { id: 218, name: 'Bijnor', code: 'BJN', stateId: 26 },
        { id: 219, name: 'Budaun', code: 'BDN', stateId: 26 },
        { id: 220, name: 'Bulandshahr', code: 'BLS', stateId: 26 },
        { id: 221, name: 'Chandauli', code: 'CHD', stateId: 26 },
        { id: 222, name: 'Chitrakoot', code: 'CHT', stateId: 26 },
        { id: 223, name: 'Deoria', code: 'DEO', stateId: 26 },
        { id: 224, name: 'Etah', code: 'ETH', stateId: 26 },
        { id: 225, name: 'Etawah', code: 'ETW', stateId: 26 },
        { id: 226, name: 'Faizabad', code: 'FZD', stateId: 26 },
        { id: 227, name: 'Farrukhabad', code: 'FRK', stateId: 26 },
        { id: 228, name: 'Fatehpur', code: 'FTP', stateId: 26 },
        { id: 229, name: 'Firozabad', code: 'FRZ', stateId: 26 },
        { id: 230, name: 'Gautam Buddha Nagar', code: 'GBN', stateId: 26 },
        { id: 231, name: 'Ghaziabad', code: 'GZB', stateId: 26 },
        { id: 232, name: 'Ghazipur', code: 'GZP', stateId: 26 },
        { id: 233, name: 'Gonda', code: 'GND', stateId: 26 },
        { id: 234, name: 'Gorakhpur', code: 'GKP', stateId: 26 },
        { id: 235, name: 'Hamirpur', code: 'HMR', stateId: 26 },
        { id: 236, name: 'Hapur', code: 'HPR', stateId: 26 },
        { id: 237, name: 'Hardoi', code: 'HRD', stateId: 26 },
        { id: 238, name: 'Hathras', code: 'HTR', stateId: 26 },
        { id: 239, name: 'Jalaun', code: 'JLN', stateId: 26 },
        { id: 240, name: 'Jaunpur', code: 'JNP', stateId: 26 },
        { id: 241, name: 'Jhansi', code: 'JHS', stateId: 26 },
        { id: 242, name: 'Kannauj', code: 'KNJ', stateId: 26 },
        { id: 243, name: 'Kanpur Dehat', code: 'KND', stateId: 26 },
        { id: 244, name: 'Kanpur Nagar', code: 'KNN', stateId: 26 },
        { id: 245, name: 'Kasganj', code: 'KSG', stateId: 26 },
        { id: 246, name: 'Kaushambi', code: 'KSB', stateId: 26 },
        { id: 247, name: 'Kushinagar', code: 'KSG', stateId: 26 },
        { id: 248, name: 'Lakhimpur Kheri', code: 'LKK', stateId: 26 },
        { id: 249, name: 'Lalitpur', code: 'LLP', stateId: 26 },
        { id: 250, name: 'Lucknow', code: 'LKO', stateId: 26 },
        { id: 251, name: 'Maharajganj', code: 'MRJ', stateId: 26 },
        { id: 252, name: 'Mahoba', code: 'MHB', stateId: 26 },
        { id: 253, name: 'Mainpuri', code: 'MNP', stateId: 26 },
        { id: 254, name: 'Mathura', code: 'MTR', stateId: 26 },
        { id: 255, name: 'Mau', code: 'MAU', stateId: 26 },
        { id: 256, name: 'Meerut', code: 'MRT', stateId: 26 },
        { id: 257, name: 'Mirzapur', code: 'MZP', stateId: 26 },
        { id: 258, name: 'Moradabad', code: 'MRD', stateId: 26 },
        { id: 259, name: 'Muzaffarnagar', code: 'MZF', stateId: 26 },
        { id: 260, name: 'Pilibhit', code: 'PLB', stateId: 26 },
        { id: 261, name: 'Pratapgarh', code: 'PTG', stateId: 26 },
        { id: 262, name: 'Prayagraj', code: 'PRY', stateId: 26 },
        { id: 263, name: 'Raebareli', code: 'RBL', stateId: 26 },
        { id: 264, name: 'Rampur', code: 'RMP', stateId: 26 },
        { id: 265, name: 'Saharanpur', code: 'SHP', stateId: 26 },
        { id: 266, name: 'Sambhal', code: 'SMB', stateId: 26 },
        { id: 267, name: 'Sant Kabir Nagar', code: 'SKN', stateId: 26 },
        { id: 268, name: 'Shahjahanpur', code: 'SJP', stateId: 26 },
        { id: 269, name: 'Shamli', code: 'SML', stateId: 26 },
        { id: 270, name: 'Shravasti', code: 'SRV', stateId: 26 },
        { id: 271, name: 'Siddharthnagar', code: 'SDN', stateId: 26 },
        { id: 272, name: 'Sitapur', code: 'STP', stateId: 26 },
        { id: 273, name: 'Sonbhadra', code: 'SNB', stateId: 26 },
        { id: 274, name: 'Sultanpur', code: 'SLP', stateId: 26 },
        { id: 275, name: 'Unnao', code: 'UNO', stateId: 26 },
        { id: 276, name: 'Varanasi', code: 'VNS', stateId: 26 }
      ]
    };
    
    return districts[stateId] || [];
  }

  // Fallback data for villages (expanded with more districts)
  static getFallbackVillages(districtId) {
    const villages = {
      9: [ // Visakhapatnam
        { id: 1, name: 'Gajuwaka', code: 'GJW', districtId: 9 },
        { id: 2, name: 'Madhurawada', code: 'MDW', districtId: 9 },
        { id: 3, name: 'PM Palem', code: 'PMP', districtId: 9 },
        { id: 4, name: 'MVP Colony', code: 'MVC', districtId: 9 },
        { id: 5, name: 'Asilmetta', code: 'ASL', districtId: 9 },
        { id: 6, name: 'Beach Road', code: 'BCH', districtId: 9 },
        { id: 7, name: 'Dwaraka Nagar', code: 'DWN', districtId: 9 },
        { id: 8, name: 'Jagadamba Centre', code: 'JGC', districtId: 9 },
        { id: 9, name: 'Kurmannapalem', code: 'KMP', districtId: 9 },
        { id: 10, name: 'Pedagantyada', code: 'PDG', districtId: 9 }
      ],
      119: [ // Nagpur
        { id: 101, name: 'Civil Lines', code: 'CVL', districtId: 119 },
        { id: 102, name: 'Sadar', code: 'SDR', districtId: 119 },
        { id: 103, name: 'Gandhibagh', code: 'GNB', districtId: 119 },
        { id: 104, name: 'Dhantoli', code: 'DNT', districtId: 119 },
        { id: 105, name: 'Lakadganj', code: 'LKD', districtId: 119 },
        { id: 106, name: 'Itwari', code: 'ITW', districtId: 119 },
        { id: 107, name: 'Ganeshpeth', code: 'GNP', districtId: 119 },
        { id: 108, name: 'Sitabuldi', code: 'STB', districtId: 119 },
        { id: 109, name: 'Mahal', code: 'MHL', districtId: 119 },
        { id: 110, name: 'Mangalwari', code: 'MNG', districtId: 119 }
      ],
      125: [ // Pune
        { id: 201, name: 'Shivajinagar', code: 'SVJ', districtId: 125 },
        { id: 202, name: 'Koregaon Park', code: 'KGP', districtId: 125 },
        { id: 203, name: 'Camp', code: 'CMP', districtId: 125 },
        { id: 204, name: 'Bund Garden', code: 'BDG', districtId: 125 },
        { id: 205, name: 'Deccan Gymkhana', code: 'DCG', districtId: 125 },
        { id: 206, name: 'Kalyani Nagar', code: 'KLN', districtId: 125 },
        { id: 207, name: 'Viman Nagar', code: 'VMN', districtId: 125 },
        { id: 208, name: 'Kharadi', code: 'KHD', districtId: 125 },
        { id: 209, name: 'Wadgaon Sheri', code: 'WGS', districtId: 125 },
        { id: 210, name: 'Hadapsar', code: 'HDP', districtId: 125 }
      ],
      132: [ // Thane
        { id: 301, name: 'Thane West', code: 'TNW', districtId: 132 },
        { id: 302, name: 'Thane East', code: 'TNE', districtId: 132 },
        { id: 303, name: 'Ghodbunder Road', code: 'GBR', districtId: 132 },
        { id: 304, name: 'Kolshet', code: 'KLS', districtId: 132 },
        { id: 305, name: 'Hiranandani Estate', code: 'HRE', districtId: 132 },
        { id: 306, name: 'Lokmanya Nagar', code: 'LMN', districtId: 132 },
        { id: 307, name: 'Naupada', code: 'NPD', districtId: 132 },
        { id: 308, name: 'Kopri', code: 'KPR', districtId: 132 },
        { id: 309, name: 'Wagle Estate', code: 'WGE', districtId: 132 },
        { id: 310, name: 'Majiwada', code: 'MJD', districtId: 132 }
      ],
      230: [ // Gautam Buddha Nagar (Noida)
        { id: 401, name: 'Sector 1', code: 'SEC1', districtId: 230 },
        { id: 402, name: 'Sector 2', code: 'SEC2', districtId: 230 },
        { id: 403, name: 'Sector 3', code: 'SEC3', districtId: 230 },
        { id: 404, name: 'Sector 4', code: 'SEC4', districtId: 230 },
        { id: 405, name: 'Sector 5', code: 'SEC5', districtId: 230 },
        { id: 406, name: 'Sector 6', code: 'SEC6', districtId: 230 },
        { id: 407, name: 'Sector 7', code: 'SEC7', districtId: 230 },
        { id: 408, name: 'Sector 8', code: 'SEC8', districtId: 230 },
        { id: 409, name: 'Sector 9', code: 'SEC9', districtId: 230 },
        { id: 410, name: 'Sector 10', code: 'SEC10', districtId: 230 }
      ],
      231: [ // Ghaziabad
        { id: 501, name: 'Raj Nagar', code: 'RJN', districtId: 231 },
        { id: 502, name: 'Vasundhara', code: 'VSD', districtId: 231 },
        { id: 503, name: 'Indirapuram', code: 'IDP', districtId: 231 },
        { id: 504, name: 'Vaishali', code: 'VSL', districtId: 231 },
        { id: 505, name: 'Kaushambi', code: 'KSM', districtId: 231 },
        { id: 506, name: 'Crossings Republik', code: 'CRR', districtId: 231 },
        { id: 507, name: 'Sahibabad', code: 'SBD', districtId: 231 },
        { id: 508, name: 'Loni', code: 'LNI', districtId: 231 },
        { id: 509, name: 'Modinagar', code: 'MDG', districtId: 231 },
        { id: 510, name: 'Hapur', code: 'HPR', districtId: 231 }
      ],
      250: [ // Lucknow
        { id: 601, name: 'Gomti Nagar', code: 'GMN', districtId: 250 },
        { id: 602, name: 'Hazratganj', code: 'HZG', districtId: 250 },
        { id: 603, name: 'Aliganj', code: 'ALG', districtId: 250 },
        { id: 604, name: 'Mahanagar', code: 'MHN', districtId: 250 },
        { id: 605, name: 'Indira Nagar', code: 'IDN', districtId: 250 },
        { id: 606, name: 'Vikas Nagar', code: 'VKN', districtId: 250 },
        { id: 607, name: 'Rajajipuram', code: 'RJP', districtId: 250 },
        { id: 608, name: 'Sitapur Road', code: 'STR', districtId: 250 },
        { id: 609, name: 'Chowk', code: 'CHK', districtId: 250 },
        { id: 610, name: 'Aminabad', code: 'AMB', districtId: 250 }
      ]
    };
    
    // If specific villages not found, return generic villages
    if (villages[districtId]) {
      return villages[districtId];
    }
    
    // Return generic villages for any district
    return [
      { id: 1001, name: 'Main City', code: 'MC', districtId: districtId },
      { id: 1002, name: 'Downtown', code: 'DT', districtId: districtId },
      { id: 1003, name: 'City Center', code: 'CC', districtId: districtId },
      { id: 1004, name: 'Residential Area', code: 'RA', districtId: districtId },
      { id: 1005, name: 'Commercial District', code: 'CD', districtId: districtId },
      { id: 1006, name: 'Industrial Area', code: 'IA', districtId: districtId },
      { id: 1007, name: 'Suburban Area', code: 'SA', districtId: districtId },
      { id: 1008, name: 'Rural Area', code: 'RA', districtId: districtId },
      { id: 1009, name: 'Village Center', code: 'VC', districtId: districtId },
      { id: 1010, name: 'Outskirts', code: 'OK', districtId: districtId }
    ];
  }

  // Clear cache
  static clearCache() {
    locationCache.states = null;
    locationCache.districts = {};
    locationCache.villages = {};
  }

  // Get location hierarchy for a specific location
  static async getLocationHierarchy(stateId, districtId, villageId) {
    try {
      const [states, districts, villages] = await Promise.all([
        this.getStates(),
        this.getDistricts(stateId),
        this.getVillages(districtId)
      ]);

      return {
        states,
        districts,
        villages,
        selectedState: states.find(s => s.id === stateId),
        selectedDistrict: districts.find(d => d.id === districtId),
        selectedVillage: villages.find(v => v.id === villageId)
      };
    } catch (error) {
      console.error('🚨 Error getting location hierarchy:', error);
      return {
        states: this.getFallbackStates(),
        districts: this.getFallbackDistricts(stateId),
        villages: this.getFallbackVillages(districtId),
        selectedState: null,
        selectedDistrict: null,
        selectedVillage: null
      };
    }
  }
}

export default LocationService;