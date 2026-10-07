## ADDED Requirements

### Requirement: Single-node k3s cluster on the Tencent host
The system SHALL install a single-node k3s cluster on host `124.220.7.175` (4 vCPU / 4 GB, OS Ubuntu) using the official k3s install script. The install MUST coexist with the already-running nginx + static-site workload without contending for ports 80/443 or destabilizing the host.

#### Scenario: k3s installed and node Ready
- **WHEN** the k3s install script completes
- **THEN** `kubectl get nodes` returns exactly one node in `Ready` state within 60 seconds

#### Scenario: Traefik disabled to free port 80 for host nginx
- **WHEN** k3s is installed
- **THEN** the default Traefik ingress controller MUST be disabled (via `--disable traefik` or equivalent) so port 80 remains owned by the host nginx serving the static site

#### Scenario: Flannel CNI runs without host-port conflicts
- **WHEN** the cluster is up
- **THEN** flannel uses the VXLAN backend and does not bind host port 80 or 443

### Requirement: Memory and CPU limits at install time
The system SHALL pass resource-limit flags to the k3s install so the kubelet + pods cannot exhaust the 4 GB node. The install MUST set an upper bound that reserves headroom for host nginx and the OS.

#### Scenario: k3s reserves memory for host processes
- **WHEN** k3s is installed with `--limits` memory bound (target ≤ 3.5 Gi usable by k3s)
- **THEN** the host retains ≥ 500 Mi free for nginx + OS after all pods reach steady state

### Requirement: local-path default StorageClass
The system SHALL keep the bundled `local-path` StorageClass as the default so PVCs (for the MCP SQLite DB and MongoDB) bind to local disk without provisioning extra infrastructure.

#### Scenario: PVC binds immediately
- **WHEN** a PVC is created with `storageClassName: local-path`
- **THEN** it reaches `Bound` within 5 seconds on the single node

### Requirement: NodePort exposure convention
The system SHALL expose all in-cluster services to the host via NodePort in the range 30800–31000, consistent with the lawcraw cluster convention. No Ingress controller SHALL be installed.

#### Scenario: services reachable on host ports
- **WHEN** a Service of type NodePort is created with a port in 30800–31000
- **THEN** it is reachable at `http://124.220.7.175:<nodePort>` from outside the host

### Requirement: kubeconfig saved for remote kubectl
The system SHALL write the kubeconfig (with the node's external IP as server) to a known path so `kubectl`/`helm` can manage the cluster.

#### Scenario: kubectl works without re-login
- **WHEN** the kubeconfig is placed at `~/.kube/config` (or exported via `KUBECONFIG`)
- **THEN** `kubectl get pods -A` succeeds from the same host shell
