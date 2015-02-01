%global cartridgedir %{_libexecdir}/openshift/cartridges/zend

Name: 		openshift-origin-cartridge-zend		
Version:	6.3
Release:	1%{?dist}
Summary:	A PHP server by Zend for applications that require preformance, reliability and security

Group:		Development/Languages
License:	ASL 2.0
URL:	 	http://blub.com	
Source0:	%{name}-%{version}.tar.gz
BuildRoot:	%(mktemp -ud %{_tmppath}/%{name}-%{version}-%{release}-XXXXXX)
BuildArch:	x86_64

Requires:	zend-server-php-5.5

%define _unpackaged_files_terminate_build 0


%description
A PHP server by Zend for applications that require preformance, reliability and security packaged as cartridge for Openshift 2.

%prep
%setup -q


%build


%install
%__rm -rf %{buildroot}
%__mkdir -p %{buildroot}/%{cartridgedir}
%__cp -r * %{buildroot}/%{cartridgedir}

%clean
rm -rf %{buildroot}


%files
%dir %{cartridgedir}
%attr(0755,-,-) %{cartridgedir}/bin/
%attr(0755,-,-) %{cartridgedir}/hooks/
%attr(0755,-,-) %{cartridgedir}/versions/6.3/configuration/user-files/bin/
%attr(0755,-,-) %{cartridgedir}/versions/6.3/bin/
%{cartridgedir}/env
%{cartridgedir}/conf
%{cartridgedir}/template
%{cartridgedir}/metadata
%{cartridgedir}




%changelog

