## IP 4 

The original intention was to use terraform. Main.TF file was created on root folder and updated.
However there was a challenge when running terraform apply command from local which took longer than expected to resolve.

Alternative option which worked was to use MongoDb, backend and frontend yaml files which were applied after connecting to the cluster using Google Cloud Shell.

Frontend image was rebuilt to use NGINX since npm run had issues. Backend connection function was also done from before rebuilding the frontend image to allow connection between the different pods.

StatefulSet was used for MongoDB. This is to provide a stable identities and persistent storage for MongoDB, ensuring that data is retained even if the pod is deleted or restarted.

Deployment was used for Backend and Frontend. Stateless applications are deployed using Deployment objects. The backend and frontend pods are managed and scaled automatically by Kubernetes.

Persistent storage was only used for MongoDB, ensuring data durability. The backend and frontend are stateless and do not require persistent storage.

LoadBalancer Service mainly applied for frontend which is to be exposed to the internet. LoadBalancer service assisted in provisioning an external IP address for access.








