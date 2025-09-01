<?php
?>

<table border="0">

<?php
   print "<tr><td class=visited_country_text>Countries with diary entries</td></tr>";
   $result = $de->get_country_count("","","",0,"" );
 
   if ( !$result )
      print "Failed on query ".mysql_error();
   else
   {
    while ( $row = mysql_fetch_array($result))
        print "<tr><td NOWRAP><a class=visited_country_link href=\"Country.php?country=$row[country_id]\">$row[country_name] ($row[total])</a></td></tr>\n";
   }
     
?>
</table>
