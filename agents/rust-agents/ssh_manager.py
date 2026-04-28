from multiprocessing import connection
import paramiko
from paramiko import SSHClient, AutoAddPolicy
from typing import Optional, Dict, List
import asyncio
from concurrent.futures import ThreadPoolExecutor
import time

class SSHconnect:
    def __init__(self, host, username, password, ID: str = None):
        self.host = host
        self.username = username
        self.password = password
        self.ClientID = ID
        self.client = Optional[SSHClient] = None


    def connection(self, key_path: str = None):
        try:
            self.client = SSHClient()
            self.client.load_system_host_keys(AutoAddPolicy())
            self.client.set_missing_host_key_policy(AutoAddPolicy())

            if key_path:
                key = paramiko.RSAKey.from_private_key_file(key_path)
                self.client.connect(
                    hostname=self.host,
                    username=self.username,
                    password=self.password,
                    pkey=key
                )

        except Exception as e:
            return {'error': str(e)}

    def execute(self, command: str) -> Dict[str, str]:
        if not self.client:
            return {'error': 'SSH client is not connected'}
        try:
            stdin, stdout, stderr = self.client.exec_command(command)

            out = stdout.read()
            err = stderr.read()

            return{
                'out':out,
                'err':err,
                'status':stdout.channel.recv_exit_status()
            }

        except Exception as e:
            return {'error': str(e)}



    def close(self):
        if self.client:
            self.client.close()



class SSHManager:
    def __init__(self, MaxConnectionsValue: int = 10):
        self.MaxConnectionsValue = Dict[str, SSHconnect] = {}
        self.executor = ThreadPoolExecutor(MCV=MaxConnectionsValue)