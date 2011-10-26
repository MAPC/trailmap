/* On-Road Bicycle Facilities */

@bikelane: #006db6;
@sharedlane: #954f9f;
@cycletrack: #5dc4b7;
@onroadroute: #aacfd3;

.onroad {
  
  line-width: 4;
  
  [zoom < 12] { line-width: 1; }
  [zoom < 16] { line-width: 2; }
  
  [path_type='BL'], [path_type='BLP'] { line-color: @bikelane;}
  [path_type='SL'], [path_type='SLP'] { line-color: @sharedlane;}
  [path_type='CT'], [path_type='CTP'] { line-color: @cycletrack;}
  
  [path_type='OR'][route='local'] { line-color: @onroadroute; }
  
  /* Proposed facilities */
  
  [path_type='BLP'], [path_type='SLP'], [path_type='CTP']
    { line-dasharray: 4,2; }
  
}