/* Regional Networks */

@walking: #d7b9ed;
@biking: #ffd380;
@baseline: 6;

@sans:"Arial Regular","Liberation Sans Regular","DejaVu Sans Book";

.regional {
  
  line-width: @baseline;
  line-opacity: 0.8;
  line-join: round; 
  
  text-face-name:@sans;
  text-placement:line;
  text-name: '[name]';
  text-halo-radius: 2;
  text-halo-fill:rgba(255,255,255,0.75);
  
  [zoom < 12] { line-width: @baseline * 1/3; }
  [zoom < 16] { line-width: @baseline * 2/3; }
  
  [category='hiking'], [category='shared-use'] { 
    line-color: @walking; 
    text-fill: darken(@walking, 40%);
  }
  [category='on-road'] { 
    line-color: @biking; 
    text-fill: darken(@biking, 40%);
  }
}

#aqueducts {
  line-width: @baseline;
  line-color: @walking;
  line-opacity: 0.8;
  line-join: round; 
  line-dasharray: 8,6;
  
  [zoom < 12] { line-width: @baseline * 1/3; }
  [zoom < 16] { line-width: @baseline * 2/3; }
  
}