while(<>) {
  cmomp;
  if (/\[([\d\/]+)\s.+\] Практики: ([\d,\s]+)\n/) {
    @parts = split(/\//, $1);
    $times = $2 =~ s/,//rg;
    $times = $times =~ s/\s/, /rg;
    print '{ "d": "'.'20'.$parts[2].'-'.$parts[1].'-'.$parts[0].'", "t": ['.$times."]},\n";
  } elsif (/Практики, \[/) {
    $_ = ~/([\d\/]+)/;
    @parts = split(/\//, $1);
  } elsif (/([\d,\s]+)\n/) {
    print '{ "d": "'.'20'.$parts[2].'-'.$parts[1].'-'.$parts[0].'", "t": ['.$1."]},\n";
  } elsif (/([\d\s]+)\n/) {
    $times=$1 =~s/\s/, /r;
    print '{ "d": "'.'20'.$parts[2].'-'.$parts[1].'-'.$parts[0].'", "t": ['.$times."]},\n";
  }
}