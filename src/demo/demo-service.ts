import {Injectable} from '@angular/core';

/**
 * interface for the timezone with abbreviation and offset
 */
export interface TimeZoneAbbrMapping {
  timezone: string;
  offset: number;
  abbreviation: string;
}

@Injectable()
export class DemoService {
  /**
   * get timezones with timezone abbreviation and offset.
   */
  getTimezoneAbbrMappings(): TimeZoneAbbrMapping[] {
    /**
     * Below timezones are adapted from:
     * https://github.com/kevalbhatt/timezone-picker/blob/master/src/timezones.json,
     * https://www.timeanddate.com/time/zones,
     * https://en.wikipedia.org/wiki/List_of_time_zone_abbreviations
     *
     * The MIT License (MIT)
     * Copyright (c) 2015 Keval Bhatt
     * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
     * associated documentation files (the "Software"), to deal in the Software without restriction,
     * including without limitation the rights to use, copy, modify, merge, publish, distribute,
     * sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     * The above copyright notice and this permission notice shall be included in all copies or
     * substantial portions of the Software.
     */
    return [
      {
        timezone: 'Etc/UTC',
        offset: 0,
        abbreviation: 'UTC'
      },
      {
        timezone: 'Antarctica/Davis',
        offset: 7,
        abbreviation: 'DAVT'
      },
      {
        timezone: 'Antarctica/Mawson',
        offset: 5,
        abbreviation: 'MAWT'
      },
      {
        timezone: 'Asia/Srednekolymsk',
        offset: 11,
        abbreviation: 'SRET'
      },
      {
        timezone: 'Antarctica/Vostok',
        offset: 6,
        abbreviation: 'VOST'
      },
      {
        timezone: 'Africa/Abidjan',
        offset: 0,
        abbreviation: 'GMT'
      },
      {
        timezone: 'Africa/Accra',
        offset: 0,
        abbreviation: 'GMT'
      },
      {
        timezone: 'Africa/Addis_Ababa',
        offset: 3,
        abbreviation: 'EAT'
      },
      {
        timezone: 'Africa/Algiers',
        offset: 1,
        abbreviation: 'CET'
      },
      {
        timezone: 'Africa/Asmara',
        offset: 3,
        abbreviation: 'EAT'
      },
      {
        timezone: 'America/New_York',
        offset: -4,
        abbreviation: 'EDT'
      },
      {
        timezone: 'Africa/Bamako',
        offset: 0,
        abbreviation: 'GMT'
      },
      {
        timezone: 'Africa/Bangui',
        offset: 1,
        abbreviation: 'WAT'
      },
      {
        timezone: 'Africa/Banjul',
        offset: 0,
        abbreviation: 'GMT'
      },
      {
        timezone: 'Africa/Bissau',
        offset: 0,
        abbreviation: 'GMT'
      },
      {
        timezone: 'Africa/Blantyre',
        offset: 2,
        abbreviation: 'CAT'
      },
      {
        timezone: 'Africa/Brazzaville',
        offset: 1,
        abbreviation: 'WAT'
      },
      {
        timezone: 'Africa/Bujumbura',
        offset: 2,
        abbreviation: 'CAT'
      },
      {
        timezone: 'Asia/Oral',
        offset: 5,
        abbreviation: 'ORAT'
      },
      {
        timezone: 'Africa/Cairo',
        offset: 2,
        abbreviation: 'EET'
      },
      {
        timezone: 'Africa/Casablanca',
        offset: 0,
        abbreviation: 'WET'
      },
      {
        timezone: 'Africa/Ceuta',
        offset: 1,
        abbreviation: 'CET'
      },
      {
        timezone: 'Africa/Conakry',
        offset: 0,
        abbreviation: 'GMT'
      },
      {
        timezone: 'Africa/Dakar',
        offset: 0,
        abbreviation: 'GMT'
      },
      {
        timezone: 'Africa/Dar_es_Salaam',
        offset: 3,
        abbreviation: 'EAT'
      },
      {
        timezone: 'Asia/Yekaterinburg',
        offset: 5,
        abbreviation: 'YEKT'
      },
      {
        timezone: 'Asia/Yekaterinburg',
        offset: 6,
        abbreviation: 'YEKST'
      },
      {
        timezone: 'Africa/Djibouti',
        offset: 3,
        abbreviation: 'EAT'
      },
      {
        timezone: 'Africa/Douala',
        offset: 1,
        abbreviation: 'WAT'
      },
      {
        timezone: 'Africa/Freetown',
        offset: 0,
        abbreviation: 'GMT'
      },
      {
        timezone: 'Africa/Gaborone',
        offset: 2,
        abbreviation: 'CAT'
      },
      {
        timezone: 'Africa/Harare',
        offset: 2,
        abbreviation: 'CAT'
      },
      {
        timezone: 'Africa/El_Aaiun',
        offset: 0,
        abbreviation: 'WET'
      },
      {
        timezone: 'Africa/Johannesburg',
        offset: 2,
        abbreviation: 'SAST'
      },
      {
        timezone: 'Africa/Juba',
        offset: 3,
        abbreviation: 'EAT'
      },
      {
        timezone: 'Africa/Kampala',
        offset: 3,
        abbreviation: 'EAT'
      },
      {
        timezone: 'Africa/Khartoum',
        offset: 3,
        abbreviation: 'EAT'
      },
      {
        timezone: 'Africa/Kinshasa',
        offset: 1,
        abbreviation: 'WAT'
      },
      {
        timezone: 'Africa/Lagos',
        offset: 1,
        abbreviation: 'WAT'
      },
      {
        timezone: 'Africa/Libreville',
        offset: 1,
        abbreviation: 'WAT'
      },
      {
        timezone: 'Africa/Lome',
        offset: 0,
        abbreviation: 'GMT'
      },
      {
        timezone: 'Africa/Kigali',
        offset: 2,
        abbreviation: 'CAT'
      },
      {
        timezone: 'Africa/Luanda',
        offset: 1,
        abbreviation: 'WAT'
      },
      {
        timezone: 'Africa/Lubumbashi',
        offset: 2,
        abbreviation: 'CAT'
      },
      {
        timezone: 'Africa/Lusaka',
        offset: 2,
        abbreviation: 'CAT'
      },
      {
        timezone: 'Africa/Malabo',
        offset: 1,
        abbreviation: 'WAT'
      },
      {
        timezone: 'Africa/Maputo',
        offset: 2,
        abbreviation: 'CAT'
      },
      {
        timezone: 'Africa/Mbabane',
        offset: 2,
        abbreviation: 'SAST'
      },
      {
        timezone: 'Africa/Mogadishu',
        offset: 3,
        abbreviation: 'EAT'
      },
      {
        timezone: 'Africa/Monrovia',
        offset: 0,
        abbreviation: 'GMT'
      },
      {
        timezone: 'Africa/Nairobi',
        offset: 3,
        abbreviation: 'EAT'
      },
      {
        timezone: 'Africa/Maseru',
        offset: 2,
        abbreviation: 'SAST'
      },
      {
        timezone: 'Africa/Ndjamena',
        offset: 1,
        abbreviation: 'WAT'
      },
      {
        timezone: 'Africa/Niamey',
        offset: 1,
        abbreviation: 'WAT'
      },
      {
        timezone: 'Africa/Nouakchott',
        offset: 0,
        abbreviation: 'GMT'
      },
      {
        timezone: 'Africa/Ouagadougou',
        offset: 0,
        abbreviation: 'GMT'
      },
      {
        timezone: 'Africa/Porto-Novo',
        offset: 1,
        abbreviation: 'WAT'
      },
      {
        timezone: 'Africa/Tunis',
        offset: 1,
        abbreviation: 'CET'
      },
      {
        timezone: 'Africa/Sao_Tome',
        offset: 0,
        abbreviation: 'GMT'
      },
      {
        timezone: 'Africa/Tripoli',
        offset: 2,
        abbreviation: 'EET'
      },
      {
        timezone: 'Africa/Windhoek',
        offset: 2,
        abbreviation: 'WAST'
      },
      {
        timezone: 'America/Adak',
        offset: -10,
        abbreviation: 'HST'
      },
      {
        timezone: 'America/Adak',
        offset: -9,
        abbreviation: 'HDT'
      },
      {
        timezone: 'America/Argentina/Salta',
        offset: -3,
        abbreviation: 'ART'
      },
      {
        timezone: 'America/Anchorage',
        offset: -9,
        abbreviation: 'AKST'
      },
      {
        timezone: 'America/Anchorage',
        offset: -8,
        abbreviation: 'AKDT'
      },
      {
        timezone: 'America/Anguilla',
        offset: -4,
        abbreviation: 'AST'
      },
      {
        timezone: 'America/Antigua',
        offset: -4,
        abbreviation: 'AST'
      },
      {
        timezone: 'America/Araguaina',
        offset: -3,
        abbreviation: 'BRT'
      },
      {
        timezone: 'America/Argentina/Buenos_Aires',
        offset: -3,
        abbreviation: 'ART'
      },
      {
        timezone: 'America/Argentina/Catamarca',
        offset: -3,
        abbreviation: 'ART'
      },
      {
        timezone: 'America/Argentina/Cordoba',
        offset: -3,
        abbreviation: 'ART'
      },
      {
        timezone: 'America/Argentina/Jujuy',
        offset: -3,
        abbreviation: 'ART'
      },
      {
        timezone: 'America/Argentina/La_Rioja',
        offset: -3,
        abbreviation: 'ART'
      },
      {
        timezone: 'America/Argentina/Mendoza',
        offset: -3,
        abbreviation: 'ART'
      },
      {
        timezone: 'America/Argentina/Rio_Gallegos',
        offset: -3,
        abbreviation: 'ART'
      },
      {
        timezone: 'America/Argentina/San_Juan',
        offset: -3,
        abbreviation: 'ART'
      },
      {
        timezone: 'America/Argentina/San_Luis',
        offset: -3,
        abbreviation: 'ART'
      },
      {
        timezone: 'America/Argentina/Tucuman',
        offset: -3,
        abbreviation: 'ART'
      },
      {
        timezone: 'America/Aruba',
        offset: -4,
        abbreviation: 'AST'
      },
      {
        timezone: 'America/Argentina/Ushuaia',
        offset: -3,
        abbreviation: 'ART'
      },
      {
        timezone: 'America/Asuncion',
        offset: -3,
        abbreviation: 'PYST'
      },
      {
        timezone: 'America/Asuncion',
        offset: -4,
        abbreviation: 'PYT'
      },
      {
        timezone: 'America/Bahia_Banderas',
        offset: -6,
        abbreviation: 'CST'
      },
      {
        timezone: 'America/Atikokan',
        offset: -5,
        abbreviation: 'EST'
      },
      {
        timezone: 'America/Bahia',
        offset: -2,
        abbreviation: 'BRT'
      },
      {
        timezone: 'America/Barbados',
        offset: -4,
        abbreviation: 'AST'
      },
      {
        timezone: 'America/Belem',
        offset: -3,
        abbreviation: 'BRT'
      },
      {
        timezone: 'America/Belize',
        offset: -6,
        abbreviation: 'CST'
      },
      {
        timezone: 'America/Blanc-Sablon',
        offset: -4,
        abbreviation: 'AST'
      },
      {
        timezone: 'America/Boa_Vista',
        offset: -4,
        abbreviation: 'AMT'
      },
      {
        timezone: 'America/Bogota',
        offset: -5,
        abbreviation: 'COT'
      },
      {
        timezone: 'America/Boise',
        offset: -7,
        abbreviation: 'MST'
      },
      {
        timezone: 'America/Cambridge_Bay',
        offset: -7,
        abbreviation: 'MST'
      },
      {
        timezone: 'America/Campo_Grande',
        offset: -3,
        abbreviation: 'AMST'
      },
      {
        timezone: 'America/Cancun',
        offset: -6,
        abbreviation: 'EST'
      },
      {
        timezone: 'America/Caracas',
        offset: -4,
        abbreviation: 'VET'
      },
      {
        timezone: 'America/Cayenne',
        offset: -3,
        abbreviation: 'GFT'
      },
      {
        timezone: 'America/Cayman',
        offset: -5,
        abbreviation: 'EST'
      },
      {
        timezone: 'America/Chicago',
        offset: -6,
        abbreviation: 'CST'
      },
      {
        timezone: 'America/Chicago',
        offset: -5,
        abbreviation: 'CDT'
      },
      {
        timezone: 'America/Chihuahua',
        offset: -7,
        abbreviation: 'MST'
      },
      {
        timezone: 'America/Coral_Harbour',
        offset: -5,
        abbreviation: 'EST'
      },
      {
        timezone: 'America/Costa_Rica',
        offset: -6,
        abbreviation: 'CST'
      },
      {
        timezone: 'America/Creston',
        offset: -7,
        abbreviation: 'MST'
      },
      {
        timezone: 'America/Cuiaba',
        offset: -3,
        abbreviation: 'AMST'
      },
      {
        timezone: 'America/Curacao',
        offset: -4,
        abbreviation: 'AST'
      },
      {
        timezone: 'America/Danmarkshavn',
        offset: 0,
        abbreviation: 'GMT'
      },
      {
        timezone: 'America/Dawson',
        offset: -8,
        abbreviation: 'PST'
      },
      {
        timezone: 'America/Dawson_Creek',
        offset: -7,
        abbreviation: 'MST'
      },
      {
        timezone: 'America/Denver',
        offset: -7,
        abbreviation: 'MST'
      },
      {
        timezone: 'America/Detroit',
        offset: -5,
        abbreviation: 'EST'
      },
      {
        timezone: 'America/Dominica',
        offset: -4,
        abbreviation: 'AST'
      },
      {
        timezone: 'America/Edmonton',
        offset: -7,
        abbreviation: 'MST'
      },
      {
        timezone: 'America/Eirunepe',
        offset: -5,
        abbreviation: 'ACT'
      },
      {
        timezone: 'America/El_Salvador',
        offset: -6,
        abbreviation: 'CST'
      },
      {
        timezone: 'America/Fortaleza',
        offset: -3,
        abbreviation: 'BRT'
      },
      {
        timezone: 'America/Glace_Bay',
        offset: -4,
        abbreviation: 'AST'
      },
      {
        timezone: 'America/Godthab',
        offset: -3,
        abbreviation: 'WGT'
      },
      {
        timezone: 'America/Goose_Bay',
        offset: -4,
        abbreviation: 'AST'
      },
      {
        timezone: 'America/Grand_Turk',
        offset: -5,
        abbreviation: 'AST'
      },
      {
        timezone: 'America/Grenada',
        offset: -4,
        abbreviation: 'AST'
      },
      {
        timezone: 'America/Guadeloupe',
        offset: -4,
        abbreviation: 'AST'
      },
      {
        timezone: 'America/Guatemala',
        offset: -6,
        abbreviation: 'CST'
      },
      {
        timezone: 'America/Guayaquil',
        offset: -5,
        abbreviation: 'ECT'
      },
      {
        timezone: 'America/Guyana',
        offset: -4,
        abbreviation: 'GYT'
      },
      {
        timezone: 'America/Halifax',
        offset: -4,
        abbreviation: 'AST'
      },
      {
        timezone: 'America/Halifax',
        offset: -3,
        abbreviation: 'ADT'
      },
      {
        timezone: 'America/Havana',
        offset: -5,
        abbreviation: 'CST'
      },
      {
        timezone: 'America/Hermosillo',
        offset: -7,
        abbreviation: 'MST'
      },
      {
        timezone: 'America/Indiana/Petersburg',
        offset: -5,
        abbreviation: 'EST'
      },
      {
        timezone: 'America/Indiana/Tell_City',
        offset: -6,
        abbreviation: 'CST'
      },
      {
        timezone: 'America/Indiana/Vevay',
        offset: -5,
        abbreviation: 'EST'
      },
      {
        timezone: 'America/Indiana/Indianapolis',
        offset: -5,
        abbreviation: 'EST'
      },
      {
        timezone: 'America/Indiana/Knox',
        offset: -6,
        abbreviation: 'CST'
      },
      {
        timezone: 'America/Indiana/Marengo',
        offset: -5,
        abbreviation: 'EST'
      },
      {
        timezone: 'America/Indiana/Vincennes',
        offset: -5,
        abbreviation: 'EST'
      },
      {
        timezone: 'America/Indiana/Winamac',
        offset: -5,
        abbreviation: 'EST'
      },
      {
        timezone: 'America/Inuvik',
        offset: -7,
        abbreviation: 'MST'
      },
      {
        timezone: 'America/Iqaluit',
        offset: -5,
        abbreviation: 'EST'
      },
      {
        timezone: 'America/La_Paz',
        offset: -4,
        abbreviation: 'BOT'
      },
      {
        timezone: 'America/Jamaica',
        offset: -5,
        abbreviation: 'EST'
      },
      {
        timezone: 'America/Juneau',
        offset: -9,
        abbreviation: 'AKST'
      },
      {
        timezone: 'America/Kentucky/Louisville',
        offset: -5,
        abbreviation: 'EST'
      },
      {
        timezone: 'America/Kentucky/Monticello',
        offset: -5,
        abbreviation: 'EST'
      },
      {
        timezone: 'America/Kralendijk',
        offset: -4,
        abbreviation: 'AST'
      },
      {
        timezone: 'America/Lima',
        offset: -5,
        abbreviation: 'PET'
      },
      {
        timezone: 'America/Managua',
        offset: -6,
        abbreviation: 'CST'
      },
      {
        timezone: 'America/Manaus',
        offset: -4,
        abbreviation: 'AMT'
      },
      {
        timezone: 'America/Los_Angeles',
        offset: -8,
        abbreviation: 'PST'
      },
      {
        timezone: 'America/Los_Angeles',
        offset: -7,
        abbreviation: 'PDT'
      },
      {
        timezone: 'America/Lower_Princes',
        offset: -4,
        abbreviation: 'AST'
      },
      {
        timezone: 'America/Maceio',
        offset: -3,
        abbreviation: 'BRT'
      },
      {
        timezone: 'America/Marigot',
        offset: -4,
        abbreviation: 'AST'
      },
      {
        timezone: 'America/Martinique',
        offset: -4,
        abbreviation: 'AST'
      },
      {
        timezone: 'America/Matamoros',
        offset: -6,
        abbreviation: 'CST'
      },
      {
        timezone: 'America/Mazatlan',
        offset: -7,
        abbreviation: 'MST'
      },
      {
        timezone: 'America/Menominee',
        offset: -6,
        abbreviation: 'CST'
      },
      {
        timezone: 'America/Mexico_City',
        offset: -6,
        abbreviation: 'CST'
      },
      {
        timezone: 'America/Merida',
        offset: -6,
        abbreviation: 'CST'
      },
      {
        timezone: 'America/Metlakatla',
        offset: -8,
        abbreviation: 'PST'
      },
      {
        timezone: 'America/Miquelon',
        offset: -3,
        abbreviation: 'PMST'
      },
      {
        timezone: 'America/Miquelon',
        offset: -2,
        abbreviation: 'PMDT'
      },
      {
        timezone: 'America/Moncton',
        offset: -4,
        abbreviation: 'AST'
      },
      {
        timezone: 'America/Monterrey',
        offset: -6,
        abbreviation: 'CST'
      },
      {
        timezone: 'America/Montevideo',
        offset: -3,
        abbreviation: 'UYT'
      },
      {
        timezone: 'America/Montevideo',
        offset: -2,
        abbreviation: 'UYST'
      },
      {
        timezone: 'America/Montreal',
        offset: -5,
        abbreviation: 'EST'
      },
      {
        timezone: 'America/Montserrat',
        offset: -4,
        abbreviation: 'AST'
      },
      {
        timezone: 'America/Nassau',
        offset: -5,
        abbreviation: 'EST'
      },
      {
        timezone: 'America/New_York',
        offset: -5,
        abbreviation: 'EST'
      },
      {
        timezone: 'America/Nipigon',
        offset: -5,
        abbreviation: 'EST'
      },
      {
        timezone: 'America/Nome',
        offset: -9,
        abbreviation: 'AKST'
      },
      {
        timezone: 'America/Noronha',
        offset: -2,
        abbreviation: 'FNT'
      },
      {
        timezone: 'America/North_Dakota/Beulah',
        offset: -6,
        abbreviation: 'CST'
      },
      {
        timezone: 'America/North_Dakota/Center',
        offset: -6,
        abbreviation: 'CST'
      },
      {
        timezone: 'America/North_Dakota/New_Salem',
        offset: -6,
        abbreviation: 'CST'
      },
      {
        timezone: 'America/Ojinaga',
        offset: -7,
        abbreviation: 'MST'
      },
      {
        timezone: 'America/Panama',
        offset: -5,
        abbreviation: 'EST'
      },
      {
        timezone: 'America/Pangnirtung',
        offset: -5,
        abbreviation: 'EST'
      },
      {
        timezone: 'America/Paramaribo',
        offset: -3,
        abbreviation: 'SRT'
      },
      {
        timezone: 'America/Phoenix',
        offset: -7,
        abbreviation: 'MST'
      },
      {
        timezone: 'America/Port-au-Prince',
        offset: -5,
        abbreviation: 'EST'
      },
      {
        timezone: 'America/Port_of_Spain',
        offset: -4,
        abbreviation: 'AST'
      },
      {
        timezone: 'America/Porto_Velho',
        offset: -4,
        abbreviation: 'AMT'
      },
      {
        timezone: 'America/Puerto_Rico',
        offset: -4,
        abbreviation: 'AST'
      },
      {
        timezone: 'America/Rainy_River',
        offset: -6,
        abbreviation: 'CST'
      },
      {
        timezone: 'America/Rankin_Inlet',
        offset: -6,
        abbreviation: 'CST'
      },
      {
        timezone: 'America/Recife',
        offset: -3,
        abbreviation: 'BRT'
      },
      {
        timezone: 'America/Regina',
        offset: -6,
        abbreviation: 'CST'
      },
      {
        timezone: 'America/Resolute',
        offset: -6,
        abbreviation: 'CST'
      },
      {
        timezone: 'America/Rio_Branco',
        offset: -5,
        abbreviation: 'ACT'
      },
      {
        timezone: 'America/Santa_Isabel',
        offset: -8,
        abbreviation: 'PST'
      },
      {
        timezone: 'America/Santarem',
        offset: -3,
        abbreviation: 'BRT'
      },
      {
        timezone: 'America/Santiago',
        offset: -4,
        abbreviation: 'CLT'
      },
      {
        timezone: 'America/Santiago',
        offset: -3,
        abbreviation: 'CLST'
      },
      {
        timezone: 'America/Santo_Domingo',
        offset: -4,
        abbreviation: 'AST'
      },
      {
        timezone: 'America/Scoresbysund',
        offset: -1,
        abbreviation: 'EGT'
      },
      {
        timezone: 'America/Sao_Paulo',
        offset: -2,
        abbreviation: 'BRST'
      },
      {
        timezone: 'America/Sitka',
        offset: -9,
        abbreviation: 'AKST'
      },
      {
        timezone: 'America/St_Barthelemy',
        offset: -4,
        abbreviation: 'AST'
      },
      {
        timezone: 'America/St_Johns',
        offset: -3.5,
        abbreviation: 'NST'
      },
      {
        timezone: 'America/Thule',
        offset: -4,
        abbreviation: 'AST'
      },
      {
        timezone: 'America/St_Kitts',
        offset: -4,
        abbreviation: 'AST'
      },
      {
        timezone: 'America/St_Lucia',
        offset: -4,
        abbreviation: 'AST'
      },
      {
        timezone: 'America/St_Thomas',
        offset: -4,
        abbreviation: 'AST'
      },
      {
        timezone: 'America/St_Vincent',
        offset: -4,
        abbreviation: 'AST'
      },
      {
        timezone: 'America/Swift_Current',
        offset: -6,
        abbreviation: 'CST'
      },
      {
        timezone: 'America/Tegucigalpa',
        offset: -6,
        abbreviation: 'CST'
      },
      {
        timezone: 'America/Thunder_Bay',
        offset: -5,
        abbreviation: 'EST'
      },
      {
        timezone: 'America/Tijuana',
        offset: -8,
        abbreviation: 'PST'
      },
      {
        timezone: 'America/Toronto',
        offset: -5,
        abbreviation: 'EST'
      },
      {
        timezone: 'America/Tortola',
        offset: -4,
        abbreviation: 'AST'
      },
      {
        timezone: 'America/Vancouver',
        offset: -8,
        abbreviation: 'PST'
      },
      {
        timezone: 'America/Vancouver',
        offset: -7,
        abbreviation: 'PDT'
      },
      {
        timezone: 'America/Whitehorse',
        offset: -8,
        abbreviation: 'PST'
      },
      {
        timezone: 'America/Winnipeg',
        offset: -6,
        abbreviation: 'CST'
      },
      {
        timezone: 'America/Yakutat',
        offset: -9,
        abbreviation: 'AKST'
      },
      {
        timezone: 'America/Yellowknife',
        offset: -7,
        abbreviation: 'MST'
      },
      {
        timezone: 'Antarctica/Macquarie',
        offset: 11,
        abbreviation: 'MIST'
      },
      {
        timezone: 'Arctic/Longyearbyen',
        offset: 1,
        abbreviation: 'CET'
      },
      {
        timezone: 'Asia/Aden',
        offset: 3,
        abbreviation: 'AST'
      },
      {
        timezone: 'Asia/Almaty',
        offset: 6,
        abbreviation: 'ALMT'
      },
      {
        timezone: 'Asia/Amman',
        offset: 2,
        abbreviation: 'EET'
      },
      {
        timezone: 'Asia/Anadyr',
        offset: 12,
        abbreviation: 'ANAT'
      },
      {
        timezone: 'Asia/Aqtau',
        offset: 5,
        abbreviation: 'AQTT'
      },
      {
        timezone: 'Asia/Aqtobe',
        offset: 5,
        abbreviation: 'AQTT'
      },
      {
        timezone: 'Asia/Ashgabat',
        offset: 5,
        abbreviation: 'TMT'
      },
      {
        timezone: 'Asia/Baghdad',
        offset: 3,
        abbreviation: 'AST'
      },
      {
        timezone: 'Asia/Bahrain',
        offset: 3,
        abbreviation: 'AST'
      },
      {
        timezone: 'Asia/Bangkok',
        offset: 7,
        abbreviation: 'ICT'
      },
      {
        timezone: 'Asia/Baku',
        offset: 4,
        abbreviation: 'AZT'
      },
      {
        timezone: 'Asia/Chongqing',
        offset: 8,
        abbreviation: 'CST'
      },
      {
        timezone: 'Asia/Beirut',
        offset: 2,
        abbreviation: 'EET'
      },
      {
        timezone: 'Asia/Bishkek',
        offset: 6,
        abbreviation: 'KGT'
      },
      {
        timezone: 'Asia/Brunei',
        offset: 8,
        abbreviation: 'BNT'
      },
      {
        timezone: 'Asia/Choibalsan',
        offset: 8,
        abbreviation: 'CHOT'
      },
      {
        timezone: 'Asia/Choibalsan',
        offset: 9,
        abbreviation: 'CHOST'
      },
      {
        timezone: 'Asia/Colombo',
        offset: 5.5,
        abbreviation: 'IST'
      },
      {
        timezone: 'Asia/Damascus',
        offset: 2,
        abbreviation: 'EET'
      },
      {
        timezone: 'Asia/Dhaka',
        offset: 6,
        abbreviation: 'BST'
      },
      {
        timezone: 'Asia/Dili',
        offset: 9,
        abbreviation: 'TLT'
      },
      {
        timezone: 'Asia/Dubai',
        offset: 4,
        abbreviation: 'GST'
      },
      {
        timezone: 'Asia/Dushanbe',
        offset: 5,
        abbreviation: 'TJT'
      },
      {
        timezone: 'Asia/Gaza',
        offset: 2,
        abbreviation: 'EET'
      },
      {
        timezone: 'Asia/Harbin',
        offset: 8,
        abbreviation: 'CST'
      },
      {
        timezone: 'Asia/Hebron',
        offset: 2,
        abbreviation: 'EET'
      },
      {
        timezone: 'Asia/Ho_Chi_Minh',
        offset: 7,
        abbreviation: 'ICT'
      },
      {
        timezone: 'Asia/Hong_Kong',
        offset: 8,
        abbreviation: 'HKT'
      },
      {
        timezone: 'Asia/Hovd',
        offset: 7,
        abbreviation: 'HOVT'
      },
      {
        timezone: 'Asia/Hovd',
        offset: 8,
        abbreviation: 'HOVST'
      },
      {
        timezone: 'Asia/Irkutsk',
        offset: 9,
        abbreviation: 'IRKT'
      },
      {
        timezone: 'Asia/Jakarta',
        offset: 7,
        abbreviation: 'WIB'
      },
      {
        timezone: 'Asia/Jayapura',
        offset: 9,
        abbreviation: 'WIT'
      },
      {
        timezone: 'Asia/Kabul',
        offset: 4.5,
        abbreviation: 'AFT'
      },
      {
        timezone: 'Asia/Jerusalem',
        offset: 2,
        abbreviation: 'IST'
      },
      {
        timezone: 'Asia/Jerusalem',
        offset: 3,
        abbreviation: 'IDT'
      },
      {
        timezone: 'Asia/Kamchatka',
        offset: 12,
        abbreviation: 'PETT'
      },
      {
        timezone: 'Asia/Kamchatka',
        offset: 12,
        abbreviation: 'PETST'
      },
      {
        timezone: 'Asia/Karachi',
        offset: 5,
        abbreviation: 'PKT'
      },
      {
        timezone: 'Asia/Kashgar',
        offset: 6,
        abbreviation: 'XJT'
      },
      {
        timezone: 'Asia/Kathmandu',
        offset: 5.75,
        abbreviation: 'NPT'
      },
      {
        timezone: 'Asia/Calcutta',
        offset: 5.5,
        abbreviation: 'IST'
      },
      {
        timezone: 'Asia/Krasnoyarsk',
        offset: 8,
        abbreviation: 'KRAST'
      },
      {
        timezone: 'Asia/Krasnoyarsk',
        offset: 7,
        abbreviation: 'KRAT'
      },
      {
        timezone: 'Asia/Kuala_Lumpur',
        offset: 8,
        abbreviation: 'MYT'
      },
      {
        timezone: 'Asia/Kuching',
        offset: 8,
        abbreviation: 'MYT'
      },
      {
        timezone: 'Asia/Kuwait',
        offset: 3,
        abbreviation: 'AST'
      },
      {
        timezone: 'Asia/Macau',
        offset: 8,
        abbreviation: 'CST'
      },
      {
        timezone: 'Asia/Magadan',
        offset: 12,
        abbreviation: 'MAGT'
      },
      {
        timezone: 'Asia/Makassar',
        offset: 8,
        abbreviation: 'WITA'
      },
      {
        timezone: 'Asia/Manila',
        offset: 8,
        abbreviation: 'PHT'
      },
      {
        timezone: 'Asia/Manila',
        offset: 8,
        abbreviation: 'PST'
      },
      {
        timezone: 'Asia/Muscat',
        offset: 4,
        abbreviation: 'GST'
      },
      {
        timezone: 'Asia/Nicosia',
        offset: 2,
        abbreviation: 'EET'
      },
      {
        timezone: 'Asia/Novokuznetsk',
        offset: 7,
        abbreviation: 'KRAT'
      },
      {
        timezone: 'Asia/Novosibirsk',
        offset: 7,
        abbreviation: 'NOVT'
      },
      {
        timezone: 'Asia/Omsk',
        offset: 7,
        abbreviation: 'OMSST'
      },
      {
        timezone: 'Asia/Omsk',
        offset: 6,
        abbreviation: 'OMST'
      },
      {
        timezone: 'Asia/Phnom_Penh',
        offset: 7,
        abbreviation: 'ICT'
      },
      {
        timezone: 'Asia/Pontianak',
        offset: 7,
        abbreviation: 'WIB'
      },
      {
        timezone: 'Asia/Pyongyang',
        offset: 9,
        abbreviation: 'KST'
      },
      {
        timezone: 'Asia/Qatar',
        offset: 3,
        abbreviation: 'AST'
      },
      {
        timezone: 'Asia/Qyzylorda',
        offset: 6,
        abbreviation: 'QYZT'
      },
      {
        timezone: 'Asia/Rangoon',
        offset: 6.5,
        abbreviation: 'MMT'
      },
      {
        timezone: 'Asia/Riyadh',
        offset: 3,
        abbreviation: 'AST'
      },
      {
        timezone: 'Asia/Sakhalin',
        offset: 11,
        abbreviation: 'SAKT'
      },
      {
        timezone: 'Asia/Samarkand',
        offset: 5,
        abbreviation: 'UZT'
      },
      {
        timezone: 'Asia/Seoul',
        offset: 9,
        abbreviation: 'KST'
      },
      {
        timezone: 'Asia/Shanghai',
        offset: 8,
        abbreviation: 'CST'
      },
      {
        timezone: 'Asia/Singapore',
        offset: 8,
        abbreviation: 'SGT'
      },
      {
        timezone: 'Asia/Taipei',
        offset: 8,
        abbreviation: 'CST'
      },
      {
        timezone: 'Asia/Tashkent',
        offset: 5,
        abbreviation: 'UZT'
      },
      {
        timezone: 'Asia/Tbilisi',
        offset: 4,
        abbreviation: 'GET'
      },
      {
        timezone: 'Asia/Tehran',
        offset: 3.5,
        abbreviation: 'IRST'
      },
      {
        timezone: 'Asia/Tehran',
        offset: 4.5,
        abbreviation: 'IRDT'
      },
      {
        timezone: 'Asia/Thimphu',
        offset: 6,
        abbreviation: 'BTT'
      },
      {
        timezone: 'Asia/Tokyo',
        offset: 9,
        abbreviation: 'JST'
      },
      {
        timezone: 'Asia/Ulaanbaatar',
        offset: 8,
        abbreviation: 'ULAT'
      },
      {
        timezone: 'Asia/Ulaanbaatar',
        offset: 9,
        abbreviation: 'ULAST'
      },
      {
        timezone: 'Asia/Urumqi',
        offset: 6,
        abbreviation: 'XJT'
      },
      {
        timezone: 'Asia/Vientiane',
        offset: 7,
        abbreviation: 'ICT'
      },
      {
        timezone: 'Asia/Vladivostok',
        offset: 10,
        abbreviation: 'VLAT'
      },
      {
        timezone: 'Asia/Vladivostok',
        offset: 11,
        abbreviation: 'VLAST'
      },
      {
        timezone: 'Asia/Yakutsk',
        offset: 10,
        abbreviation: 'YAKT'
      },
      {
        timezone: 'Asia/Yerevan',
        offset: 4,
        abbreviation: 'AMT'
      },
      {
        timezone: 'Atlantic/Azores',
        offset: -1,
        abbreviation: 'AZOT'
      },
      {
        timezone: 'Atlantic/Azores',
        offset: 0,
        abbreviation: 'AZOST'
      },
      {
        timezone: 'Atlantic/Bermuda',
        offset: -4,
        abbreviation: 'AST'
      },
      {
        timezone: 'Atlantic/Canary',
        offset: 0,
        abbreviation: 'WET'
      },
      {
        timezone: 'Atlantic/Cape_Verde',
        offset: -1,
        abbreviation: 'CVT'
      },
      {
        timezone: 'Atlantic/Faroe',
        offset: 0,
        abbreviation: 'WET'
      },
      {
        timezone: 'Atlantic/Madeira',
        offset: 0,
        abbreviation: 'WET'
      },
      {
        timezone: 'Atlantic/Reykjavik',
        offset: 0,
        abbreviation: 'GMT'
      },
      {
        timezone: 'Atlantic/South_Georgia',
        offset: -2,
        abbreviation: 'GST'
      },
      {
        timezone: 'Atlantic/St_Helena',
        offset: 0,
        abbreviation: 'GMT'
      },
      {
        timezone: 'Atlantic/Stanley',
        offset: -3,
        abbreviation: 'FKST'
      },
      {
        timezone: 'Atlantic/Stanley',
        offset: -4,
        abbreviation: 'FKT'
      },
      {
        timezone: 'Australia/Adelaide',
        offset: 10.5,
        abbreviation: 'ACDT'
      },
      {
        timezone: 'Australia/Brisbane',
        offset: 10,
        abbreviation: 'AEST'
      },
      {
        timezone: 'Australia/Broken_Hill',
        offset: 10.5,
        abbreviation: 'ACDT'
      },
      {
        timezone: 'Australia/Currie',
        offset: 11,
        abbreviation: 'AEDT'
      },
      {
        timezone: 'Australia/Darwin',
        offset: 9.5,
        abbreviation: 'ACST'
      },
      {
        timezone: 'Australia/Eucla',
        offset: 8.75,
        abbreviation: 'ACWST'
      },
      {
        timezone: 'Australia/Hobart',
        offset: 11,
        abbreviation: 'AEDT'
      },
      {
        timezone: 'Australia/Lindeman',
        offset: 10,
        abbreviation: 'AEST'
      },
      {
        timezone: 'Australia/Lord_Howe',
        offset: 11,
        abbreviation: 'LHDT'
      },
      {
        timezone: 'Australia/Melbourne',
        offset: 11,
        abbreviation: 'AEDT'
      },
      {
        timezone: 'Australia/Perth',
        offset: 8,
        abbreviation: 'AWST'
      },
      {
        timezone: 'Australia/Sydney',
        offset: 11,
        abbreviation: 'AEDT'
      },
      {
        timezone: 'Europe/Amsterdam',
        offset: 1,
        abbreviation: 'CET'
      },
      {
        timezone: 'Europe/Andorra',
        offset: 1,
        abbreviation: 'CET'
      },
      {
        timezone: 'Europe/Athens',
        offset: 2,
        abbreviation: 'EET'
      },
      {
        timezone: 'Europe/Belgrade',
        offset: 1,
        abbreviation: 'CET'
      },
      {
        timezone: 'Europe/Bucharest',
        offset: 2,
        abbreviation: 'EET'
      },
      {
        timezone: 'Europe/Bucharest',
        offset: 3,
        abbreviation: 'EEST'
      },
      {
        timezone: 'Europe/Berlin',
        offset: 1,
        abbreviation: 'CET'
      },
      {
        timezone: 'Europe/Budapest',
        offset: 1,
        abbreviation: 'CET'
      },
      {
        timezone: 'Europe/Chisinau',
        offset: 2,
        abbreviation: 'EET'
      },
      {
        timezone: 'Europe/Bratislava',
        offset: 1,
        abbreviation: 'CET'
      },
      {
        timezone: 'Europe/Brussels',
        offset: 1,
        abbreviation: 'CET'
      },
      {
        timezone: 'Europe/Brussels',
        offset: 2,
        abbreviation: 'CEST'
      },
      {
        timezone: 'Europe/Copenhagen',
        offset: 1,
        abbreviation: 'CET'
      },
      {
        timezone: 'Europe/Dublin',
        offset: 0,
        abbreviation: 'GMT'
      },
      {
        timezone: 'Europe/Gibraltar',
        offset: 1,
        abbreviation: 'CET'
      },
      {
        timezone: 'Europe/Guernsey',
        offset: 0,
        abbreviation: 'GMT'
      },
      {
        timezone: 'Europe/Helsinki',
        offset: 2,
        abbreviation: 'EET'
      },
      {
        timezone: 'Europe/Isle_of_Man',
        offset: 0,
        abbreviation: 'GMT'
      },
      {
        timezone: 'Europe/Istanbul',
        offset: 2,
        abbreviation: 'EET'
      },
      {
        timezone: 'Europe/Jersey',
        offset: 0,
        abbreviation: 'GMT'
      },
      {
        timezone: 'Europe/Kaliningrad',
        offset: 3,
        abbreviation: 'EET'
      },
      {
        timezone: 'Europe/Kiev',
        offset: 2,
        abbreviation: 'EET'
      },
      {
        timezone: 'Europe/Lisbon',
        offset: 0,
        abbreviation: 'WET'
      },
      {
        timezone: 'Europe/Lisbon',
        offset: 1,
        abbreviation: 'WEST'
      },
      {
        timezone: 'Europe/Ljubljana',
        offset: 1,
        abbreviation: 'CET'
      },
      {
        timezone: 'Europe/London',
        offset: 0,
        abbreviation: 'GMT'
      },
      {
        timezone: 'Europe/London',
        offset: 1,
        abbreviation: 'BST'
      },
      {
        timezone: 'Europe/Luxembourg',
        offset: 1,
        abbreviation: 'CET'
      },
      {
        timezone: 'Europe/Madrid',
        offset: 1,
        abbreviation: 'CET'
      },
      {
        timezone: 'Europe/Malta',
        offset: 1,
        abbreviation: 'CET'
      },
      {
        timezone: 'Europe/Mariehamn',
        offset: 2,
        abbreviation: 'EET'
      },
      {
        timezone: 'Europe/Minsk',
        offset: 3,
        abbreviation: 'MSK'
      },
      {
        timezone: 'Europe/Monaco',
        offset: 1,
        abbreviation: 'CET'
      },
      {
        timezone: 'Europe/Moscow',
        offset: 4,
        abbreviation: 'MSD'
      },
      {
        timezone: 'Europe/Moscow',
        offset: 3,
        abbreviation: 'MSK'
      },
      {
        timezone: 'Europe/Oslo',
        offset: 1,
        abbreviation: 'CET'
      },
      {
        timezone: 'Europe/Paris',
        offset: 1,
        abbreviation: 'CET'
      },
      {
        timezone: 'Europe/Podgorica',
        offset: 1,
        abbreviation: 'CET'
      },
      {
        timezone: 'Europe/Prague',
        offset: 1,
        abbreviation: 'CET'
      },
      {
        timezone: 'Europe/Riga',
        offset: 2,
        abbreviation: 'EET'
      },
      {
        timezone: 'Europe/Rome',
        offset: 1,
        abbreviation: 'CET'
      },
      {
        timezone: 'Europe/Samara',
        offset: 4,
        abbreviation: 'SAMT'
      },
      {
        timezone: 'Europe/San_Marino',
        offset: 1,
        abbreviation: 'CET'
      },
      {
        timezone: 'Europe/Sarajevo',
        offset: 1,
        abbreviation: 'CET'
      },
      {
        timezone: 'Europe/Skopje',
        offset: 1,
        abbreviation: 'CET'
      },
      {
        timezone: 'Europe/Sofia',
        offset: 2,
        abbreviation: 'EET'
      },
      {
        timezone: 'Europe/Stockholm',
        offset: 1,
        abbreviation: 'CET'
      },
      {
        timezone: 'Europe/Tallinn',
        offset: 2,
        abbreviation: 'EET'
      },
      {
        timezone: 'Europe/Tirane',
        offset: 1,
        abbreviation: 'CET'
      },
      {
        timezone: 'Europe/Uzhgorod',
        offset: 2,
        abbreviation: 'EET'
      },
      {
        timezone: 'Europe/Vaduz',
        offset: 1,
        abbreviation: 'CET'
      },
      {
        timezone: 'Europe/Vatican',
        offset: 1,
        abbreviation: 'CET'
      },
      {
        timezone: 'Europe/Vienna',
        offset: 1,
        abbreviation: 'CET'
      },
      {
        timezone: 'Europe/Vilnius',
        offset: 2,
        abbreviation: 'EET'
      },
      {
        timezone: 'Europe/Warsaw',
        offset: 1,
        abbreviation: 'CET'
      },
      {
        timezone: 'Europe/Zagreb',
        offset: 1,
        abbreviation: 'CET'
      },
      {
        timezone: 'Europe/Zaporozhye',
        offset: 2,
        abbreviation: 'EET'
      },
      {
        timezone: 'Europe/Zurich',
        offset: 1,
        abbreviation: 'CET'
      },
      {
        timezone: 'Indian/Antananarivo',
        offset: 3,
        abbreviation: 'EAT'
      },
      {
        timezone: 'Indian/Chagos',
        offset: 6,
        abbreviation: 'IOT'
      },
      {
        timezone: 'Indian/Christmas',
        offset: 7,
        abbreviation: 'CXT'
      },
      {
        timezone: 'Indian/Cocos',
        offset: 6.5,
        abbreviation: 'CCT'
      },
      {
        timezone: 'Indian/Comoro',
        offset: 3,
        abbreviation: 'EAT'
      },
      {
        timezone: 'Indian/Kerguelen',
        offset: 5,
        abbreviation: 'TFT'
      },
      {
        timezone: 'Indian/Mahe',
        offset: 4,
        abbreviation: 'SCT'
      },
      {
        timezone: 'Indian/Maldives',
        offset: 5,
        abbreviation: 'MVT'
      },
      {
        timezone: 'Indian/Mauritius',
        offset: 4,
        abbreviation: 'MUT'
      },
      {
        timezone: 'Indian/Mayotte',
        offset: 3,
        abbreviation: 'EAT'
      },
      {
        timezone: 'Indian/Reunion',
        offset: 4,
        abbreviation: 'RET'
      },
      {
        timezone: 'Pacific/Apia',
        offset: 14,
        abbreviation: 'WSDT'
      },
      {
        timezone: 'Pacific/Auckland',
        offset: 13,
        abbreviation: 'NZDT'
      },
      {
        timezone: 'Pacific/Auckland',
        offset: 12,
        abbreviation: 'NZST'
      },
      {
        timezone: 'Pacific/Chatham',
        offset: 13.75,
        abbreviation: 'CHADT'
      },
      {
        timezone: 'Pacific/Chatham',
        offset: 12.75,
        abbreviation: 'CHAST'
      },
      {
        timezone: 'Pacific/Chuuk',
        offset: 10,
        abbreviation: 'CHUT'
      },
      {
        timezone: 'Pacific/Easter',
        offset: -6,
        abbreviation: 'EAST'
      },
      {
        timezone: 'Pacific/Easter',
        offset: -5,
        abbreviation: 'EASST'
      },
      {
        timezone: 'Pacific/Enderbury',
        offset: 13,
        abbreviation: 'PHOT'
      },
      {
        timezone: 'Pacific/Fakaofo',
        offset: 13,
        abbreviation: 'TKT'
      },
      {
        timezone: 'Pacific/Efate',
        offset: 11,
        abbreviation: 'VUT'
      },
      {
        timezone: 'Pacific/Fiji',
        offset: 12,
        abbreviation: 'FJT'
      },
      {
        timezone: 'Pacific/Fiji',
        offset: 13,
        abbreviation: 'FJST'
      },
      {
        timezone: 'Pacific/Funafuti',
        offset: 12,
        abbreviation: 'TVT'
      },
      {
        timezone: 'Pacific/Galapagos',
        offset: -6,
        abbreviation: 'GALT'
      },
      {
        timezone: 'Pacific/Gambier',
        offset: -9,
        abbreviation: 'GAMT'
      },
      {
        timezone: 'Pacific/Kwajalein',
        offset: 12,
        abbreviation: 'MHT'
      },
      {
        timezone: 'Pacific/Guadalcanal',
        offset: 11,
        abbreviation: 'SBT'
      },
      {
        timezone: 'Pacific/Guam',
        offset: 10,
        abbreviation: 'ChST'
      },
      {
        timezone: 'Pacific/Honolulu',
        offset: -10,
        abbreviation: 'HST'
      },
      {
        timezone: 'Pacific/Johnston',
        offset: -10,
        abbreviation: 'HST'
      },
      {
        timezone: 'Pacific/Kiritimati',
        offset: 14,
        abbreviation: 'LINT'
      },
      {
        timezone: 'Pacific/Kosrae',
        offset: 11,
        abbreviation: 'KOST'
      },
      {
        timezone: 'Pacific/Majuro',
        offset: 12,
        abbreviation: 'MHT'
      },
      {
        timezone: 'Pacific/Midway',
        offset: -11,
        abbreviation: 'SST'
      },
      {
        timezone: 'Pacific/Marquesas',
        offset: -9.5,
        abbreviation: 'MART'
      },
      {
        timezone: 'Pacific/Nauru',
        offset: 12,
        abbreviation: 'NRT'
      },
      {
        timezone: 'Pacific/Niue',
        offset: -11,
        abbreviation: 'NUT'
      },
      {
        timezone: 'Pacific/Norfolk',
        offset: 11,
        abbreviation: 'NFT'
      },
      {
        timezone: 'Pacific/Noumea',
        offset: 11,
        abbreviation: 'NCT'
      },
      {
        timezone: 'Pacific/Pago_Pago',
        offset: -11,
        abbreviation: 'SST'
      },
      {
        timezone: 'Pacific/Palau',
        offset: 9,
        abbreviation: 'PWT'
      },
      {
        timezone: 'Pacific/Pitcairn',
        offset: -8,
        abbreviation: 'PST'
      },
      {
        timezone: 'Pacific/Pohnpei',
        offset: 11,
        abbreviation: 'PONT'
      },
      {
        timezone: 'Pacific/Port_Moresby',
        offset: 10,
        abbreviation: 'PGT'
      },
      {
        timezone: 'Pacific/Rarotonga',
        offset: -10,
        abbreviation: 'CKT'
      },
      {
        timezone: 'Pacific/Saipan',
        offset: 10,
        abbreviation: 'ChST'
      },
      {
        timezone: 'Pacific/Tahiti',
        offset: -10,
        abbreviation: 'TAHT'
      },
      {
        timezone: 'Pacific/Tarawa',
        offset: 12,
        abbreviation: 'GILT'
      },
      {
        timezone: 'Pacific/Tongatapu',
        offset: 13,
        abbreviation: 'TOT'
      },
      {
        timezone: 'Pacific/Wake',
        offset: 12,
        abbreviation: 'WAKT'
      },
      {
        timezone: 'Pacific/Wallis',
        offset: 12,
        abbreviation: 'WFT'
      }];
  }
}
