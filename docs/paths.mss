/* Paths and Trails */

@improved: #199440;
@unimproved: #82541f;
@walking: #db7e3d;
@water: #1a2967;
@baseline: 4;

.paths {
  
  line-width: @baseline;
  
  [zoom < 12] { line-width: @baseline / 4; }
  [zoom < 16] { line-width: @baseline / 2; }
  
  [path_type='E'], [path_type='PP'] { line-color: @improved;}
  [path_type='U'], { line-color: @unimproved;}
  [path_type='T'], [path_type='TP'] { 
    line-color: @walking;
    line-width: @baseline / 2;
    [zoom < 12] { line-width: @baseline / 8; }
    [zoom < 16] { line-width: @baseline / 4; }
    [category='water'] { line-color: @water; }
  }
  
  /* Proposed facilities */
  
  [path_type='PP'], [path_type='TP']
    { line-dasharray: 4,3; }
  
}

