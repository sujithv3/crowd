FROM mysql:latest


COPY init.sql /docker-entrypoint-initdb.d/init.sql

# Set the root password for MySQL
ENV MYSQL_ROOT_PASSWORD=Root@123

# Create a custom database, user, and password
#ENV MYSQL_DATABASE=db1
#ENV MYSQL_USER=admin
#ENV MYSQL_PASSWORD=admin123

ENV MYSQL_DATABASE=db1
ENV MYSQL_USER=adec
ENV MYSQL_PASSWORD=adec123

# Copy custom configuration files into the container
COPY my.cnf /etc/mysql/conf.d/my.cnf

# Copy the SQL script to initialize the database
COPY init.sql /docker-entrypoint-initdb.d/init.sql
#COPY ./scripts/ /docker-entrypoint-initdb.d/
RUN chmod +x /docker-entrypoint-initdb.d/init.sql
# Expose the MySQL port
EXPOSE 3306

# Start the MySQL server
CMD ["mysqld"]
