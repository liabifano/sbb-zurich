#!/usr/bin/env python
from setuptools import setup, find_packages

setup(name='model_app',
      url='',
      author='',
      package_dir={'': 'src'},
      packages=find_packages('src'),
      version='0.0.1',
      install_requires=['Flask==0.12.2',
                        'Flask-Script==2.0.5',
                        'Flask-SQLAlchemy==2.2',
                        'flask-jsontools==0.1.1.post0',
                        'Flask-API==0.7.1',
                        'Flask-Login==0.4.0'],
      include_package_data=True,
      zip_safe=False)