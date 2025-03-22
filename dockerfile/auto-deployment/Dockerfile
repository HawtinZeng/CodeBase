FROM gitlab/gitlab-runner:latest
LABEL maintainer=hawtinzeng@gmail.com

RUN apt-get update -y \
	&& apt-get upgrade -y \
	&& apt-get install -y openssh-client \
	&& apt-get install -y git \
	&& apt-get install -y vim \
	&& apt install curl -y \
	&& curl -sL https://deb.nodesource.com/setup_16.x -o /tmp/nodesource_setup.sh	\
	&& bash /tmp/nodesource_setup.sh \
	&& apt install nodejs -y \